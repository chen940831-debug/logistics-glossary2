(() => {
    'use strict';

    const elements = {
        root: document.getElementById('roleMap'),
        desktopMap: document.getElementById('roleDesktopMap'),
        mobileMap: document.getElementById('roleMobileMap'),
        relationshipSummary: document.getElementById('roleRelationshipSummary'),
        detail: document.getElementById('roleDetailPanel'),
        status: document.getElementById('roleMapStatus'),
        error: document.getElementById('roleLoadError'),
        startJourney: document.getElementById('startRoleJourney'),
        closeJourney: document.getElementById('closeRoleJourney'),
        journeyPanel: document.getElementById('roleJourneyPanel'),
        journeyProgress: document.getElementById('roleJourneyProgress'),
        journeyTitle: document.getElementById('roleJourneyTitle'),
        journeySummary: document.getElementById('roleJourneySummary'),
        journeyRoles: document.getElementById('roleJourneyRoles'),
        journeyDisclaimer: document.getElementById('roleJourneyDisclaimer'),
        journeyPrevious: document.getElementById('roleJourneyPrevious'),
        journeyNext: document.getElementById('roleJourneyNext')
    };

    if (!elements.root) return;

    const state = {
        roleData: null,
        processes: [],
        documents: [],
        terms: [],
        roleById: new Map(),
        relationshipsByRole: new Map(),
        processIndex: new Map(),
        documentIndex: new Map(),
        selectedRoleId: null,
        selectedRelationshipId: null,
        journeyIndex: 0,
        resizeFrame: null
    };

    const mainPath = ['shipper', 'freight-forwarder', 'carrier', 'overseas-agent', 'consignee'];

    async function loadJson(path, fallback) {
        if (window.location.protocol === 'file:' && fallback) return fallback;
        try {
            const response = await fetch(path, { cache: 'no-store' });
            if (!response.ok) throw new Error(`${path} HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (fallback) return fallback;
            throw error;
        }
    }

    function validateRoleData(data) {
        if (!data || !Array.isArray(data.roles) || !Array.isArray(data.relationships)) {
            throw new Error('Role data schema is incomplete.');
        }

        const ids = new Set();
        data.roles.forEach(role => {
            if (!role.id || ids.has(role.id)) throw new Error(`Invalid or duplicate role id: ${role.id || 'unknown'}`);
            ids.add(role.id);
        });

        data.relationships.forEach(relationship => {
            if (!ids.has(relationship.fromRoleId) || !ids.has(relationship.toRoleId)) {
                throw new Error(`Relationship references an unknown role: ${relationship.id}`);
            }
        });
    }

    function buildIndexes() {
        state.roleById = new Map(state.roleData.roles.map(role => [role.id, role]));
        state.relationshipsByRole = new Map(state.roleData.roles.map(role => [role.id, []]));
        state.processIndex = new Map(state.roleData.roles.map(role => [role.id, new Map()]));
        state.documentIndex = new Map(state.roleData.roles.map(role => [role.id, []]));

        state.roleData.relationships.forEach(relationship => {
            state.relationshipsByRole.get(relationship.fromRoleId).push(relationship);
            state.relationshipsByRole.get(relationship.toRoleId).push(relationship);
        });

        const aliases = new Map(state.roleData.actorAliases.map(alias => [alias.sourceValue, alias]));
        state.processes.forEach(process => {
            process.steps.forEach(step => {
                const actors = step.detail && Array.isArray(step.detail.actors) ? step.detail.actors : [];
                actors.forEach(actor => {
                    const alias = aliases.get(actor);
                    if (!alias || !state.processIndex.has(alias.roleId)) return;
                    const roleProcesses = state.processIndex.get(alias.roleId);
                    if (!roleProcesses.has(process.id)) {
                        roleProcesses.set(process.id, {
                            id: process.id,
                            title: process.title,
                            actorLabels: new Set(),
                            matchTypes: new Set(),
                            stepIds: new Set()
                        });
                    }
                    const entry = roleProcesses.get(process.id);
                    entry.actorLabels.add(actor);
                    entry.matchTypes.add(alias.matchType);
                    entry.stepIds.add(step.id);
                });
            });
        });

        state.documents.forEach(documentTemplate => {
            (documentTemplate.roleIds || []).forEach(roleId => {
                if (state.documentIndex.has(roleId)) state.documentIndex.get(roleId).push(documentTemplate);
            });
        });
    }

    function createRoleButton(role, className = 'role-node') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.roleId = role.id;
        button.setAttribute('aria-label', `查看角色：${role.name}，${role.chineseName}`);
        const name = document.createElement('strong');
        name.textContent = role.name;
        const chineseName = document.createElement('span');
        chineseName.textContent = role.chineseName;
        button.append(name, chineseName);
        button.addEventListener('click', () => selectRole(role.id, true));
        return button;
    }

    function renderDesktopMap() {
        elements.desktopMap.replaceChildren();
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('role-connection-layer');
        svg.setAttribute('aria-hidden', 'true');
        elements.desktopMap.appendChild(svg);

        state.roleData.roles.forEach(role => {
            elements.desktopMap.appendChild(createRoleButton(role));
        });

        window.requestAnimationFrame(drawConnections);
    }

    function drawConnections() {
        const svg = elements.desktopMap.querySelector('.role-connection-layer');
        if (!svg || elements.desktopMap.offsetParent === null) return;
        svg.replaceChildren();
        elements.desktopMap.querySelectorAll('.role-relationship-trigger').forEach(button => button.remove());

        const canvasRect = elements.desktopMap.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${canvasRect.width} ${canvasRect.height}`);

        state.roleData.relationships.forEach((relationship, index) => {
            const fromNode = elements.desktopMap.querySelector(`[data-role-id="${relationship.fromRoleId}"]`);
            const toNode = elements.desktopMap.querySelector(`[data-role-id="${relationship.toRoleId}"]`);
            if (!fromNode || !toNode) return;

            const fromRect = fromNode.getBoundingClientRect();
            const toRect = toNode.getBoundingClientRect();
            const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
            const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
            const x2 = toRect.left - canvasRect.left + toRect.width / 2;
            const y2 = toRect.top - canvasRect.top + toRect.height / 2;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('role-connection-line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.style.animationDelay = `${index * 45}ms`;
            svg.appendChild(line);

            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'role-relationship-trigger';
            trigger.textContent = '↔';
            trigger.style.left = `${(x1 + x2) / 2}px`;
            trigger.style.top = `${(y1 + y2) / 2}px`;
            trigger.dataset.relationshipId = relationship.id;
            trigger.setAttribute('aria-label', relationshipLabel(relationship));
            trigger.addEventListener('click', () => showRelationship(relationship.id));
            trigger.addEventListener('mouseenter', () => showRelationship(relationship.id));
            trigger.addEventListener('focus', () => showRelationship(relationship.id));
            elements.desktopMap.appendChild(trigger);
        });
    }

    function relationshipLabel(relationship) {
        const from = state.roleById.get(relationship.fromRoleId);
        const to = state.roleById.get(relationship.toRoleId);
        return `查看 ${from.name} 與 ${to.name} 的互動關係`;
    }

    function findRelationship(firstId, secondId) {
        return state.roleData.relationships.find(relationship =>
            (relationship.fromRoleId === firstId && relationship.toRoleId === secondId) ||
            (relationship.fromRoleId === secondId && relationship.toRoleId === firstId)
        );
    }

    function createMobileRelationship(relationship, label = '查看互動說明') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'role-secondary-button';
        button.textContent = label;
        button.setAttribute('aria-label', relationshipLabel(relationship));
        button.addEventListener('click', () => showRelationship(relationship.id));
        return button;
    }

    function renderMobileMap() {
        elements.mobileMap.replaceChildren();
        mainPath.forEach((roleId, index) => {
            const role = state.roleById.get(roleId);
            elements.mobileMap.appendChild(createRoleButton(role, 'role-mobile-node'));

            if (roleId === 'freight-forwarder') {
                const branches = document.createElement('div');
                branches.className = 'role-mobile-branches';
                const clearanceLabel = document.createElement('p');
                clearanceLabel.className = 'role-mobile-branch-label';
                clearanceLabel.textContent = '通關協作';
                branches.append(clearanceLabel);
                branches.appendChild(createMobileRelationship(findRelationship('freight-forwarder', 'customs-broker'), '查看 Forwarder 與報關業者的互動'));
                branches.appendChild(createRoleButton(state.roleById.get('customs-broker'), 'role-mobile-node'));
                const brokerCustoms = findRelationship('customs-broker', 'customs');
                branches.appendChild(createMobileRelationship(brokerCustoms, '查看報關業者與海關的互動'));
                branches.appendChild(createRoleButton(state.roleById.get('customs'), 'role-mobile-node'));

                const warehouseLabel = document.createElement('p');
                warehouseLabel.className = 'role-mobile-branch-label';
                warehouseLabel.textContent = '倉儲協作';
                branches.append(warehouseLabel);
                branches.appendChild(createMobileRelationship(findRelationship('freight-forwarder', 'warehouse'), '查看 Forwarder 與倉庫的互動'));
                branches.appendChild(createRoleButton(state.roleById.get('warehouse'), 'role-mobile-node'));
                elements.mobileMap.appendChild(branches);
            }

            if (index < mainPath.length - 1) {
                const relationship = findRelationship(roleId, mainPath[index + 1]);
                if (relationship) elements.mobileMap.appendChild(createMobileRelationship(relationship));
                const arrow = document.createElement('div');
                arrow.className = 'role-mobile-arrow';
                arrow.setAttribute('aria-hidden', 'true');
                arrow.textContent = '↓';
                elements.mobileMap.appendChild(arrow);
            }
        });
    }

    function showRelationship(relationshipId) {
        const relationship = state.roleData.relationships.find(item => item.id === relationshipId);
        if (!relationship) return;
        state.selectedRelationshipId = relationshipId;
        const from = state.roleById.get(relationship.fromRoleId);
        const to = state.roleById.get(relationship.toRoleId);
        elements.relationshipSummary.replaceChildren();
        const heading = document.createElement('strong');
        heading.textContent = `${from.name} ↔ ${to.name}`;
        const description = document.createElement('span');
        description.textContent = ` ${relationship.summary}`;
        elements.relationshipSummary.append(heading, description);
        document.querySelectorAll('.role-relationship-trigger').forEach(button => {
            button.classList.toggle('is-selected', button.dataset.relationshipId === relationshipId);
        });
    }

    function createList(items, className) {
        const list = document.createElement('ul');
        list.className = className;
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            list.appendChild(listItem);
        });
        return list;
    }

    function appendRelatedDetails(container, label, items, createLink) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `${label}（${items.length}）`;
        details.appendChild(summary);
        if (items.length) {
            const list = document.createElement('ul');
            list.className = 'role-link-list';
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.appendChild(createLink(item));
                list.appendChild(listItem);
            });
            details.appendChild(list);
        } else {
            const empty = document.createElement('p');
            empty.className = 'role-empty-link';
            empty.textContent = '目前沒有經確認的關聯資料。';
            details.appendChild(empty);
        }
        container.appendChild(details);
    }

    function selectRole(roleId, shouldScroll = false) {
        const role = state.roleById.get(roleId);
        if (!role) return;
        state.selectedRoleId = roleId;
        document.querySelectorAll('[data-role-id]').forEach(button => {
            const selected = button.dataset.roleId === roleId;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        renderRoleDetail(role);
        if (shouldScroll && window.matchMedia('(max-width: 960px)').matches) {
            elements.detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderRoleDetail(role) {
        elements.detail.replaceChildren();

        const kicker = document.createElement('p');
        kicker.className = 'role-detail-kicker';
        kicker.textContent = role.reviewStatus === 'verified' ? 'Role detail' : 'Role detail · 待人工複核';
        const title = document.createElement('h2');
        title.id = 'activeRoleTitle';
        title.textContent = role.name;
        const chineseName = document.createElement('p');
        chineseName.className = 'role-detail-chinese';
        chineseName.textContent = role.chineseName;
        const explanation = document.createElement('p');
        explanation.className = 'role-detail-summary';
        explanation.textContent = role.beginnerExplanation;
        elements.detail.append(kicker, title, chineseName, explanation);

        if (Array.isArray(role.carrierVariants) && role.carrierVariants.length) {
            const variants = document.createElement('ul');
            variants.className = 'role-variant-list';
            role.carrierVariants.forEach(variant => {
                const item = document.createElement('li');
                item.textContent = `${variant.mode}：${variant.name}｜${variant.chineseName}`;
                variants.appendChild(item);
            });
            elements.detail.appendChild(variants);
        }

        const responsibilitySection = document.createElement('section');
        responsibilitySection.className = 'role-detail-section';
        const responsibilityTitle = document.createElement('h3');
        responsibilityTitle.textContent = '他主要做什麼？';
        responsibilitySection.append(responsibilityTitle, createList(role.mainResponsibilities.slice(0, 5), 'role-responsibility-list'));
        elements.detail.appendChild(responsibilitySection);

        const relationships = state.relationshipsByRole.get(role.id) || [];
        const partnerNames = relationships.map(relationship => {
            const partnerId = relationship.fromRoleId === role.id ? relationship.toRoleId : relationship.fromRoleId;
            return state.roleById.get(partnerId).name;
        });
        const interactionSection = document.createElement('section');
        interactionSection.className = 'role-detail-section';
        const interactionTitle = document.createElement('h3');
        interactionTitle.textContent = '他通常跟誰合作？';
        interactionSection.append(interactionTitle, createList(partnerNames, 'role-interaction-list'));
        elements.detail.appendChild(interactionSection);

        const related = document.createElement('section');
        related.className = 'role-detail-section role-detail-links';
        const relatedTitle = document.createElement('h3');
        relatedTitle.textContent = '繼續探索';
        related.appendChild(relatedTitle);

        const processItems = [...(state.processIndex.get(role.id) || new Map()).values()];
        appendRelatedDetails(related, '查看相關流程', processItems, process => {
            const link = document.createElement('a');
            link.href = `clearance-map.html?process=${encodeURIComponent(process.id)}`;
            const contextual = process.matchTypes.has('contextual') ? '（以 Exporter 相關步驟呈現）' : '';
            link.textContent = `${process.title}${contextual}`;
            return link;
        });

        const documents = state.documentIndex.get(role.id) || [];
        appendRelatedDetails(related, '查看相關文件', documents, documentTemplate => {
            const link = document.createElement('a');
            link.href = `documents.html?document=${encodeURIComponent(documentTemplate.id)}`;
            link.textContent = `${documentTemplate.abbreviation}｜${documentTemplate.chineseTitle}`;
            return link;
        });

        const termCodes = new Set(state.terms.map(term => term.code));
        const terms = role.relatedTerms.filter(code => termCodes.has(code));
        appendRelatedDetails(related, '查看相關名詞', terms, code => {
            const link = document.createElement('a');
            link.href = `index.html?search=${encodeURIComponent(code)}`;
            link.textContent = code;
            return link;
        });
        elements.detail.appendChild(related);
    }

    function startJourney() {
        state.journeyIndex = 0;
        elements.journeyPanel.hidden = false;
        renderJourneyStage();
        elements.journeyPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderJourneyStage() {
        const journey = state.roleData.guidedJourney;
        const stage = journey.stages[state.journeyIndex];
        elements.journeyProgress.textContent = `${state.journeyIndex + 1} / ${journey.stages.length}`;
        elements.journeyTitle.textContent = stage.title;
        elements.journeySummary.textContent = stage.summary;
        elements.journeyDisclaimer.textContent = journey.disclaimer;
        elements.journeyRoles.replaceChildren();
        stage.roleIds.forEach(roleId => {
            const role = state.roleById.get(roleId);
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = `${role.name}｜${role.chineseName}`;
            button.addEventListener('click', () => selectRole(roleId, true));
            elements.journeyRoles.appendChild(button);
        });
        elements.journeyPrevious.disabled = state.journeyIndex === 0;
        elements.journeyNext.textContent = state.journeyIndex === journey.stages.length - 1 ? '完成' : '下一步 →';
        document.querySelectorAll('[data-role-id]').forEach(button => {
            button.classList.toggle('is-journey-active', stage.roleIds.includes(button.dataset.roleId));
        });
        selectRole(stage.roleIds[0]);
    }

    function moveJourney(direction) {
        const stages = state.roleData.guidedJourney.stages;
        if (direction > 0 && state.journeyIndex === stages.length - 1) {
            elements.journeyPanel.hidden = true;
            document.querySelectorAll('[data-role-id]').forEach(button => button.classList.remove('is-journey-active'));
            return;
        }
        state.journeyIndex = Math.max(0, Math.min(stages.length - 1, state.journeyIndex + direction));
        renderJourneyStage();
    }

    function bindEvents() {
        elements.startJourney.addEventListener('click', startJourney);
        elements.closeJourney.addEventListener('click', () => {
            elements.journeyPanel.hidden = true;
            document.querySelectorAll('[data-role-id]').forEach(button => button.classList.remove('is-journey-active'));
        });
        elements.journeyPrevious.addEventListener('click', () => moveJourney(-1));
        elements.journeyNext.addEventListener('click', () => moveJourney(1));
        window.addEventListener('resize', () => {
            window.cancelAnimationFrame(state.resizeFrame);
            state.resizeFrame = window.requestAnimationFrame(drawConnections);
        }, { passive: true });
    }

    async function initializeRoleMap() {
        bindEvents();
        try {
            const [roleData, processData, documentData, terms] = await Promise.all([
                loadJson('data/roles.json', window.LOGISTICS_ROLE_DATA_FALLBACK),
                loadJson('data/clearance-processes.json', window.CLEARANCE_PROCESS_DATA_FALLBACK),
                loadJson('data/document-templates.json', window.DOCUMENT_TEMPLATE_FALLBACK ? { templates: window.DOCUMENT_TEMPLATE_FALLBACK } : null),
                loadJson('data/terms.json', window.LOGISTICS_TERMS)
            ]);
            validateRoleData(roleData);
            state.roleData = roleData;
            state.processes = Array.isArray(processData.processes) ? processData.processes : [];
            state.documents = Array.isArray(documentData.templates) ? documentData.templates : [];
            state.terms = Array.isArray(terms) ? terms : [];
            buildIndexes();
            renderDesktopMap();
            renderMobileMap();
            elements.status.textContent = `已載入 ${roleData.roles.length} 個核心角色`;
            document.getElementById('roleDisclaimer').textContent = roleData.disclaimer;
            showRelationship(roleData.relationships[0].id);
            selectRole('freight-forwarder');
        } catch (error) {
            console.error('[Role Map] Failed to initialize:', error);
            elements.status.textContent = '角色資料載入失敗';
            elements.error.hidden = false;
            elements.detail.hidden = true;
        }
    }

    initializeRoleMap();
})();
