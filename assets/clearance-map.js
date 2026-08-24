(() => {
    'use strict';

    const state = {
        data: null,
        activeProcess: null,
        viewMode: 'guided',
        currentStageIndex: 0,
        selectedStepId: null,
        revealedAnswers: new Set(),
        stageObserver: null,
        edgeDrawFrame: null
    };

    const elements = {
        dataStatus: document.getElementById('clearanceDataStatus'),
        processCards: document.getElementById('clearanceProcessCards'),
        workspace: document.getElementById('clearanceWorkspace'),
        loadError: document.getElementById('clearanceLoadError'),
        activeTitle: document.getElementById('activeProcessTitle'),
        activeEnglishTitle: document.getElementById('activeProcessEnglishTitle'),
        activeDescription: document.getElementById('activeProcessDescription'),
        activeStatus: document.getElementById('activeProcessStatus'),
        guidedModeButton: document.getElementById('guidedModeButton'),
        fullModeButton: document.getElementById('fullModeButton'),
        guidedProgress: document.getElementById('guidedProgress'),
        flow: document.getElementById('clearanceFlow'),
        guidedControls: document.getElementById('guidedControls'),
        previousButton: document.getElementById('previousStageButton'),
        nextButton: document.getElementById('nextStageButton'),
        detailPanel: document.getElementById('clearanceDetailPanel'),
        detailTitle: document.getElementById('detailTitle'),
        detailEnglishTitle: document.getElementById('detailEnglishTitle'),
        detailSummary: document.getElementById('detailSummary'),
        detailContent: document.getElementById('detailContent'),
        detailWhatHappens: document.getElementById('detailWhatHappens'),
        detailActors: document.getElementById('detailActors'),
        detailDocuments: document.getElementById('detailDocuments'),
        detailTip: document.getElementById('detailTip'),
        differenceSection: document.getElementById('differenceSection'),
        detailDifference: document.getElementById('detailDifference'),
        detailTerms: document.getElementById('detailTerms')
    };

    const statusLabels = {
        verified: '已依來源核對',
        'needs-review': '待人工複核',
        outdated: '內容可能過時'
    };

    async function loadClearanceData() {
        const fallbackData = window.CLEARANCE_PROCESS_DATA_FALLBACK;
        if (window.location.protocol === 'file:' && fallbackData) {
            return fallbackData;
        }

        try {
            const response = await fetch('data/clearance-processes.json', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Clearance data HTTP ${response.status}`);
            }
            return response.json();
        } catch (error) {
            if (fallbackData) {
                return fallbackData;
            }
            throw error;
        }
    }

    function validateProcessData(data) {
        if (!data || !Array.isArray(data.processes) || data.processes.length === 0) {
            throw new Error('Clearance data has no processes.');
        }

        const allowedStatuses = new Set(data.reviewStatuses || []);

        data.processes.forEach(process => {
            if (!process.id || !Array.isArray(process.steps) || !Array.isArray(process.teachingStages) || !Array.isArray(process.flowEdges)) {
                throw new Error(`Invalid clearance process: ${process.id || 'unknown'}`);
            }

            if (!allowedStatuses.has(process.reviewStatus)) {
                throw new Error(`Invalid process review status: ${process.id}`);
            }

            const stepIds = new Set();
            process.steps.forEach(step => {
                if (!step.id || stepIds.has(step.id)) {
                    throw new Error(`Duplicate or missing step id in ${process.id}`);
                }
                stepIds.add(step.id);
                if (!allowedStatuses.has(step.reviewStatus)) {
                    throw new Error(`Invalid step review status: ${step.id}`);
                }
            });

            process.entryStepIds.forEach(stepId => {
                if (!stepIds.has(stepId)) {
                    throw new Error(`Missing entry step ${stepId} in ${process.id}`);
                }
            });

            process.steps.forEach(step => {
                (step.nextStepIds || []).forEach(nextStepId => {
                    if (!stepIds.has(nextStepId)) {
                        throw new Error(`Broken nextStepId ${nextStepId} from ${step.id}`);
                    }
                });
            });

            process.flowEdges.forEach(edge => {
                if (!stepIds.has(edge.fromStepId) || !stepIds.has(edge.toStepId)) {
                    throw new Error(`Broken flow edge ${edge.fromStepId} -> ${edge.toStepId} in ${process.id}`);
                }
            });

            process.teachingStages.forEach(stage => {
                stage.nodeIds.forEach(stepId => {
                    if (!stepIds.has(stepId)) {
                        throw new Error(`Missing teaching step ${stepId} in ${process.id}`);
                    }
                });
                (stage.prompt?.answerNodeIds || []).forEach(stepId => {
                    if (!stepIds.has(stepId)) {
                        throw new Error(`Missing answer step ${stepId} in ${process.id}`);
                    }
                });
            });
        });
    }

    function getStep(stepId) {
        return state.activeProcess.steps.find(step => step.id === stepId) || null;
    }

    function createProcessCard(process, index) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'clearance-process-card';
        button.dataset.processId = process.id;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => selectProcess(process.id));

        const number = document.createElement('span');
        number.className = 'clearance-card-index';
        number.textContent = String(index + 1).padStart(2, '0');

        const title = document.createElement('span');
        title.className = 'clearance-card-title block';
        title.textContent = process.title;

        const englishTitle = document.createElement('span');
        englishTitle.className = 'clearance-card-english block';
        englishTitle.textContent = process.englishTitle;

        const description = document.createElement('span');
        description.className = 'clearance-card-description block';
        description.textContent = process.description;

        button.append(number, title, englishTitle, description);
        return button;
    }

    function renderProcessCards() {
        elements.processCards.replaceChildren();
        state.data.processes.forEach((process, index) => {
            elements.processCards.appendChild(createProcessCard(process, index));
        });
    }

    function selectProcess(processId) {
        const process = state.data.processes.find(item => item.id === processId);
        if (!process) {
            return;
        }

        state.activeProcess = process;
        state.viewMode = 'guided';
        state.currentStageIndex = 0;
        state.selectedStepId = null;
        state.revealedAnswers.clear();

        document.querySelectorAll('.clearance-process-card').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.processId === processId));
        });

        elements.activeTitle.textContent = process.title;
        elements.activeEnglishTitle.textContent = process.englishTitle;
        elements.activeDescription.textContent = process.description;
        elements.activeStatus.textContent = statusLabels[process.reviewStatus] || process.reviewStatus;
        elements.activeStatus.dataset.status = process.reviewStatus;
        elements.workspace.classList.remove('hidden');

        updateModeButtons();
        renderFlow();
        resetDetailPanel();
        elements.workspace.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
    }

    function getScrollBehavior() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    function setViewMode(mode) {
        state.viewMode = mode;
        if (mode === 'guided') {
            state.currentStageIndex = Math.min(
                state.currentStageIndex,
                state.activeProcess.teachingStages.length - 1
            );
        }
        updateModeButtons();
        renderFlow();
    }

    function updateModeButtons() {
        const guided = state.viewMode === 'guided';
        elements.guidedModeButton.setAttribute('aria-pressed', String(guided));
        elements.fullModeButton.setAttribute('aria-pressed', String(!guided));
        elements.guidedControls.classList.toggle('hidden', !guided);
        elements.guidedProgress.classList.toggle('hidden', !guided);
    }

    function createNodeButton(step) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'clearance-node';
        button.dataset.stepId = step.id;
        button.dataset.nodeType = step.nodeType;
        if (step.clearanceCode) {
            button.dataset.clearanceCode = step.clearanceCode;
        }
        button.setAttribute('aria-pressed', String(state.selectedStepId === step.id));
        button.addEventListener('click', () => selectStep(step.id));

        if (step.clearanceCode) {
            const code = document.createElement('span');
            code.className = 'clearance-node-code';
            code.textContent = step.clearanceCode;
            button.appendChild(code);
        }

        const title = document.createElement('span');
        title.className = 'clearance-node-title';
        title.textContent = step.title;

        const summary = document.createElement('span');
        summary.className = 'clearance-node-summary';
        summary.textContent = step.shortDescription;

        button.append(title, summary);
        return button;
    }

    function createPrompt(stage) {
        const wrapper = document.createElement('div');
        wrapper.className = 'clearance-question';

        const question = document.createElement('p');
        question.className = 'clearance-question-title';
        question.textContent = stage.prompt.question;
        wrapper.appendChild(question);

        const isRevealed = state.revealedAnswers.has(stage.id);
        if (!isRevealed) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'clearance-answer-button';
            button.textContent = '顯示答案';
            button.addEventListener('click', () => {
                state.revealedAnswers.add(stage.id);
                renderFlow();
            });
            wrapper.appendChild(button);
            return wrapper;
        }

        const answer = document.createElement('div');
        answer.className = 'clearance-answer';

        const answerText = document.createElement('p');
        answerText.textContent = stage.prompt.answer;
        answer.appendChild(answerText);

        const answerNodes = document.createElement('div');
        answerNodes.className = 'clearance-chip-list';
        stage.prompt.answerNodeIds.forEach(stepId => {
            const step = getStep(stepId);
            if (!step) {
                return;
            }
            const chip = document.createElement('span');
            chip.className = 'clearance-chip';
            chip.textContent = `${step.clearanceCode || ''} ${step.title}`.trim();
            answerNodes.appendChild(chip);
        });
        answer.appendChild(answerNodes);
        wrapper.appendChild(answer);
        return wrapper;
    }

    function createStage(stage, index, isLastVisibleStage) {
        const section = document.createElement('section');
        section.className = 'clearance-stage';
        section.dataset.stageId = stage.id;
        section.dataset.stageIndex = String(index);

        const label = document.createElement('p');
        label.className = 'clearance-stage-label';
        label.textContent = `${String(index + 1).padStart(2, '0')} · ${stage.title}`;
        section.appendChild(label);

        const nodes = document.createElement('div');
        nodes.className = 'clearance-stage-nodes';
        nodes.dataset.nodeCount = String(stage.nodeIds.length);
        stage.nodeIds.forEach(stepId => {
            const step = getStep(stepId);
            if (step) {
                nodes.appendChild(createNodeButton(step));
            }
        });
        section.appendChild(nodes);

        if (state.viewMode === 'guided' && isLastVisibleStage && stage.prompt) {
            const promptWrapper = document.createElement('div');
            promptWrapper.className = 'mt-3';
            promptWrapper.appendChild(createPrompt(stage));
            section.appendChild(promptWrapper);
        }

        return section;
    }

    function createSvgElement(tagName, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        return element;
    }

    function getEdgeRoute(edge) {
        const label = String(edge.label || '').toUpperCase();
        if (label.startsWith('C1')) return 'c1';
        if (label.startsWith('C2')) return 'c2';
        if (label.startsWith('C3')) return 'c3';

        const sourceStep = getStep(edge.fromStepId);
        return sourceStep?.clearanceCode?.toLowerCase() || 'main';
    }

    function appendArrowMarkers(defs) {
        ['main', 'c1', 'c2', 'c3'].forEach(route => {
            const marker = createSvgElement('marker', {
                id: `clearance-arrow-${route}`,
                viewBox: '0 0 10 10',
                refX: '8.5',
                refY: '5',
                markerWidth: '7',
                markerHeight: '7',
                orient: 'auto-start-reverse'
            });
            marker.appendChild(createSvgElement('path', {
                d: 'M 0 0 L 10 5 L 0 10 z',
                class: `clearance-arrow-head clearance-arrow-head-${route}`
            }));
            defs.appendChild(marker);
        });
    }

    function createEdgeLabel(edge, route, sourcePoint, targetPoint) {
        if (!edge.label) {
            return null;
        }

        const labelX = sourcePoint.x + ((targetPoint.x - sourcePoint.x) * 0.52);
        const labelY = sourcePoint.y + ((targetPoint.y - sourcePoint.y) * 0.46);
        const group = createSvgElement('g', {
            class: `clearance-edge-label clearance-edge-label-${route}`,
            transform: `translate(${labelX} ${labelY})`,
            'aria-hidden': 'true'
        });
        const width = Math.max(32, String(edge.label).length * 12 + 14);
        group.appendChild(createSvgElement('rect', {
            x: String(-width / 2),
            y: '-11',
            width: String(width),
            height: '22',
            rx: '11'
        }));
        const text = createSvgElement('text', {
            x: '0',
            y: '4',
            'text-anchor': 'middle'
        });
        text.textContent = edge.label;
        group.appendChild(text);
        return group;
    }

    function syncEdgeVisibility() {
        elements.flow.querySelectorAll('.clearance-edge-group').forEach(group => {
            const targetStage = elements.flow.querySelector(`[data-stage-id="${group.dataset.targetStageId}"]`);
            group.classList.toggle('is-visible', Boolean(targetStage?.classList.contains('is-visible')));
        });
    }

    function drawFlowEdges() {
        const graph = elements.flow.querySelector('.clearance-graph');
        const layers = graph?.querySelector('.clearance-graph-layers');
        if (!graph || !layers) {
            return;
        }

        graph.querySelector('.clearance-edge-canvas')?.remove();
        const graphRect = graph.getBoundingClientRect();
        if (!graphRect.width || !graphRect.height) {
            return;
        }

        const svg = createSvgElement('svg', {
            class: 'clearance-edge-canvas',
            viewBox: `0 0 ${graphRect.width} ${graphRect.height}`,
            preserveAspectRatio: 'none',
            'aria-hidden': 'true'
        });
        const defs = createSvgElement('defs');
        appendArrowMarkers(defs);
        svg.appendChild(defs);

        state.activeProcess.flowEdges.forEach((edge, edgeIndex) => {
            const sourceNode = graph.querySelector(`[data-step-id="${edge.fromStepId}"]`);
            const targetNode = graph.querySelector(`[data-step-id="${edge.toStepId}"]`);
            if (!sourceNode || !targetNode) {
                return;
            }

            const sourceRect = sourceNode.getBoundingClientRect();
            const targetRect = targetNode.getBoundingClientRect();
            const sourcePoint = {
                x: sourceRect.left - graphRect.left + (sourceRect.width / 2),
                y: sourceRect.bottom - graphRect.top
            };
            const targetPoint = {
                x: targetRect.left - graphRect.left + (targetRect.width / 2),
                y: targetRect.top - graphRect.top
            };
            const verticalDistance = targetPoint.y - sourcePoint.y;
            if (verticalDistance <= 0) {
                return;
            }

            const route = getEdgeRoute(edge);
            const controlOffset = Math.max(20, Math.min(verticalDistance * 0.46, 82));
            const pathData = [
                `M ${sourcePoint.x} ${sourcePoint.y}`,
                `C ${sourcePoint.x} ${sourcePoint.y + controlOffset}`,
                `${targetPoint.x} ${targetPoint.y - controlOffset}`,
                `${targetPoint.x} ${targetPoint.y}`
            ].join(' ');
            const group = createSvgElement('g', {
                class: `clearance-edge-group clearance-edge-group-${route}`
            });
            group.dataset.targetStageId = targetNode.closest('.clearance-stage')?.dataset.stageId || '';
            group.style.setProperty('--edge-delay', `${Math.min(edgeIndex * 28, 360)}ms`);

            const path = createSvgElement('path', {
                d: pathData,
                class: `clearance-edge clearance-edge-${route}`,
                'marker-end': `url(#clearance-arrow-${route})`,
                'vector-effect': 'non-scaling-stroke'
            });
            group.appendChild(path);
            const label = createEdgeLabel(edge, route, sourcePoint, targetPoint);
            if (label) {
                group.appendChild(label);
            }
            svg.appendChild(group);
        });

        graph.prepend(svg);
        syncEdgeVisibility();
    }

    function scheduleEdgeDraw() {
        if (state.edgeDrawFrame) {
            cancelAnimationFrame(state.edgeDrawFrame);
        }
        state.edgeDrawFrame = requestAnimationFrame(() => {
            state.edgeDrawFrame = requestAnimationFrame(() => {
                drawFlowEdges();
                state.edgeDrawFrame = null;
            });
        });
    }

    function setupStageReveal() {
        state.stageObserver?.disconnect();
        state.stageObserver = null;
        const stages = elements.flow.querySelectorAll('.clearance-stage');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (state.viewMode === 'guided' || reduceMotion || !('IntersectionObserver' in window)) {
            stages.forEach(stage => stage.classList.add('is-visible'));
            syncEdgeVisibility();
            return;
        }

        state.stageObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add('is-visible');
                state.stageObserver.unobserve(entry.target);
            });
            syncEdgeVisibility();
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12
        });

        stages.forEach((stage, index) => {
            if (index === 0) {
                stage.classList.add('is-visible');
            } else {
                state.stageObserver.observe(stage);
            }
        });
    }

    function renderFlow() {
        if (!state.activeProcess) {
            return;
        }

        elements.flow.replaceChildren();
        const stages = state.activeProcess.teachingStages;
        const visibleStages = state.viewMode === 'full'
            ? stages
            : stages.slice(0, state.currentStageIndex + 1);

        const graph = document.createElement('div');
        graph.className = 'clearance-graph';
        const layers = document.createElement('div');
        layers.className = 'clearance-graph-layers';

        visibleStages.forEach((stage, index) => {
            layers.appendChild(createStage(stage, index, index === visibleStages.length - 1));
        });
        graph.appendChild(layers);
        elements.flow.appendChild(graph);
        setupStageReveal();
        scheduleEdgeDraw();

        const currentStage = stages[state.currentStageIndex];
        const promptNeedsAnswer = state.viewMode === 'guided'
            && currentStage?.prompt
            && !state.revealedAnswers.has(currentStage.id);

        elements.previousButton.disabled = state.currentStageIndex === 0;
        elements.nextButton.disabled = state.currentStageIndex >= stages.length - 1 || Boolean(promptNeedsAnswer);
        elements.nextButton.textContent = state.currentStageIndex >= stages.length - 1 ? '教學完成' : '下一步 →';
        elements.guidedProgress.textContent = state.viewMode === 'guided'
            ? `新手教學 ${state.currentStageIndex + 1} / ${stages.length} · ${currentStage.title}${promptNeedsAnswer ? ' · 請先顯示答案' : ''}`
            : '';
    }

    function moveStage(offset) {
        const lastIndex = state.activeProcess.teachingStages.length - 1;
        state.currentStageIndex = Math.max(0, Math.min(lastIndex, state.currentStageIndex + offset));
        renderFlow();
        elements.flow.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
    }

    function selectStep(stepId) {
        const step = getStep(stepId);
        if (!step) {
            return;
        }

        state.selectedStepId = stepId;
        document.querySelectorAll('.clearance-node').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.stepId === stepId));
        });

        elements.detailTitle.textContent = step.clearanceCode
            ? `${step.clearanceCode} · ${step.title}`
            : step.title;
        elements.detailEnglishTitle.textContent = step.englishTitle || '';
        elements.detailSummary.textContent = step.shortDescription;
        elements.detailWhatHappens.textContent = step.detail.whatHappens || '來源未提供進一步說明。';
        elements.detailTip.textContent = step.detail.newbieTip || '目前沒有額外提醒。';
        renderChips(elements.detailActors, step.detail.actors, '來源未列出參與角色');
        renderChips(elements.detailDocuments, step.detail.documents, '來源未列出特定文件');
        renderTerms(step.relatedTerms);

        const hasDifference = Boolean(step.differenceNote);
        elements.differenceSection.classList.toggle('hidden', !hasDifference);
        elements.detailDifference.textContent = step.differenceNote || '';
        elements.detailContent.classList.remove('hidden');

        if (window.matchMedia('(max-width: 900px)').matches) {
            elements.detailPanel.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
        }
    }

    function renderChips(container, values, emptyMessage) {
        container.replaceChildren();
        if (!Array.isArray(values) || values.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'clearance-empty-chip';
            empty.textContent = emptyMessage;
            container.appendChild(empty);
            return;
        }

        values.forEach(value => {
            const chip = document.createElement('span');
            chip.className = 'clearance-chip';
            chip.textContent = value;
            container.appendChild(chip);
        });
    }

    function renderTerms(terms) {
        elements.detailTerms.replaceChildren();
        if (!Array.isArray(terms) || terms.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'clearance-empty-chip';
            empty.textContent = '目前未連結既有名詞';
            elements.detailTerms.appendChild(empty);
            return;
        }

        terms.forEach(term => {
            const link = document.createElement('a');
            link.className = 'clearance-term-link';
            link.href = `index.html?search=${encodeURIComponent(term.query)}`;
            link.textContent = term.label;
            link.setAttribute('aria-label', `前往名詞查詢：${term.label}`);
            elements.detailTerms.appendChild(link);
        });
    }

    function resetDetailPanel() {
        elements.detailTitle.textContent = '選擇一個流程節點';
        elements.detailEnglishTitle.textContent = '';
        elements.detailSummary.textContent = '節點內容會顯示在這裡。';
        elements.detailContent.classList.add('hidden');
        elements.differenceSection.classList.add('hidden');
    }

    function bindEvents() {
        elements.guidedModeButton.addEventListener('click', () => setViewMode('guided'));
        elements.fullModeButton.addEventListener('click', () => setViewMode('full'));
        elements.previousButton.addEventListener('click', () => moveStage(-1));
        elements.nextButton.addEventListener('click', () => moveStage(1));
        window.addEventListener('resize', scheduleEdgeDraw, { passive: true });
    }

    async function initializeClearanceMap() {
        bindEvents();
        try {
            const data = await loadClearanceData();
            validateProcessData(data);
            state.data = data;
            renderProcessCards();
            elements.dataStatus.textContent = `已載入 ${data.processes.length} 條流程`;
            const requestedProcessId = new URLSearchParams(window.location.search).get('process');
            const requestedProcess = data.processes.find(process => process.id === requestedProcessId);
            selectProcess((requestedProcess || data.processes[0]).id);
        } catch (error) {
            console.error('[Clearance Map] Failed to initialize:', error);
            elements.dataStatus.textContent = '載入失敗';
            elements.workspace.classList.add('hidden');
            elements.loadError.classList.remove('hidden');
        }
    }

    initializeClearanceMap();
})();
