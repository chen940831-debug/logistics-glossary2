const customsProcesses = window.CUSTOMS_PROCESS_DATA;
const processTabs = document.getElementById('processTabs');
const processFlowTitle = document.getElementById('processFlowTitle');
const processFlowSummary = document.getElementById('processFlowSummary');
const processSteps = document.getElementById('processSteps');

function createValueList(values, itemClassName) {
    const list = document.createElement('ul');
    list.className = 'space-y-1.5';

    values.forEach(value => {
        const item = document.createElement('li');
        item.className = itemClassName;
        item.textContent = value;
        list.appendChild(item);
    });

    return list;
}

function createInfoBlock(title, values, variant) {
    const section = document.createElement('section');
    section.className = 'process-info-block process-info-block--' + variant;

    const heading = document.createElement('h4');
    heading.className = 'text-xs font-black tracking-wide mb-2';
    heading.textContent = title;

    section.append(heading, createValueList(values, 'text-xs leading-5'));
    return section;
}

function createTermLinks(terms) {
    const container = document.createElement('div');
    container.className = 'flex flex-wrap gap-2';

    terms.forEach(term => {
        const link = document.createElement('a');
        link.className = 'process-term-link';
        link.href = 'index.html?search=' + encodeURIComponent(term.query);
        link.textContent = term.label;
        link.setAttribute('aria-label', '在名詞查詢頁搜尋 ' + term.label);
        container.appendChild(link);
    });

    return container;
}

function createStepCard(step, index) {
    const item = document.createElement('li');
    item.className = 'process-step';

    const marker = document.createElement('div');
    marker.className = 'process-step-marker';
    marker.textContent = String(index + 1);
    marker.setAttribute('aria-hidden', 'true');

    const card = document.createElement('article');
    card.className = 'process-step-card';

    const header = document.createElement('div');
    header.className = 'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2';

    const headingGroup = document.createElement('div');
    const stepId = document.createElement('p');
    stepId.className = 'text-[11px] font-black tracking-wider text-indigo-600';
    stepId.textContent = step.stepId;
    const title = document.createElement('h3');
    title.className = 'mt-1 text-lg font-black text-indigo-950';
    title.textContent = step.title;
    headingGroup.append(stepId, title);

    const roleCount = document.createElement('span');
    roleCount.className = 'self-start rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700';
    roleCount.textContent = step.roles.length + ' 個參與角色';
    header.append(headingGroup, roleCount);

    const summary = document.createElement('p');
    summary.className = 'mt-3 text-sm leading-6 text-slate-600';
    summary.textContent = step.summary;

    const infoGrid = document.createElement('div');
    infoGrid.className = 'grid md:grid-cols-2 gap-3 mt-4';
    infoGrid.append(
        createInfoBlock('參與角色', step.roles, 'roles'),
        createInfoBlock('需要文件', step.documents, 'documents'),
        createInfoBlock('常見錯誤', step.commonErrors, 'errors')
    );

    const tip = document.createElement('section');
    tip.className = 'process-info-block process-info-block--tip';
    const tipTitle = document.createElement('h4');
    tipTitle.className = 'text-xs font-black tracking-wide mb-2';
    tipTitle.textContent = '新手提醒';
    const tipText = document.createElement('p');
    tipText.className = 'text-xs leading-5';
    tipText.textContent = step.beginnerTip;
    tip.append(tipTitle, tipText);
    infoGrid.appendChild(tip);

    const termSection = document.createElement('section');
    termSection.className = 'mt-4 pt-4 border-t border-slate-200';
    const termTitle = document.createElement('h4');
    termTitle.className = 'text-xs font-black text-slate-700 mb-2';
    termTitle.textContent = '相關名詞連結';
    termSection.append(termTitle, createTermLinks(step.relatedTerms));

    card.append(header, summary, infoGrid, termSection);
    item.append(marker, card);
    return item;
}

function renderProcess(process) {
    processFlowTitle.textContent = process.title;
    processFlowSummary.textContent = process.summary;
    processSteps.replaceChildren();

    process.steps.forEach((step, index) => {
        processSteps.appendChild(createStepCard(step, index));
    });
}

function selectProcess(processId) {
    const selectedProcess = customsProcesses.find(process => process.id === processId);
    if (!selectedProcess) return;

    document.querySelectorAll('.process-tab').forEach(button => {
        const isSelected = button.dataset.processId === processId;
        button.classList.toggle('is-active', isSelected);
        button.setAttribute('aria-selected', String(isSelected));
        button.tabIndex = isSelected ? 0 : -1;
    });

    renderProcess(selectedProcess);
}

function createProcessTabs() {
    customsProcesses.forEach((process, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'process-tab';
        button.dataset.processId = process.id;
        button.textContent = process.title;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('aria-controls', 'processPanel');
        button.tabIndex = index === 0 ? 0 : -1;
        button.addEventListener('click', () => selectProcess(process.id));
        processTabs.appendChild(button);
    });
}

function connectMindMapProcessNodes() {
    const topicProcessMap = {
        'export-process': 'export-customs',
        'import-process': 'import-customs'
    };

    Object.entries(topicProcessMap).forEach(([topicId, processId]) => {
        const topicButton = document.querySelector('[data-topic-id="' + topicId + '"]');
        if (topicButton) {
            topicButton.addEventListener('click', () => selectProcess(processId));
        }
    });
}

function initializeCustomsProcesses() {
    if (!Array.isArray(customsProcesses) || customsProcesses.length === 0) {
        processFlowTitle.textContent = '報關流程資料尚未建立。';
        processFlowSummary.textContent = '';
        return;
    }

    createProcessTabs();
    connectMindMapProcessNodes();
    selectProcess(customsProcesses[0].id);
}

initializeCustomsProcesses();
