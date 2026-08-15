const mapData = window.LEARNING_MAP_DATA;
const branchesContainer = document.getElementById('mapBranches');
const detailPanel = document.getElementById('topicDetail');
const detailGroup = document.getElementById('detailGroup');
const detailTitle = document.getElementById('detailTitle');
const detailSummary = document.getElementById('detailSummary');
const detailPoints = document.getElementById('detailPoints');
const detailTerms = document.getElementById('detailTerms');

function createTopicButton(group, topic) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'map-node-button';
    button.textContent = topic.title;
    button.dataset.topicId = topic.id;
    button.setAttribute('aria-controls', 'topicDetail');
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
        selectTopic(group, topic, button);
        if (window.matchMedia('(max-width: 767px)').matches) {
            detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    return button;
}

function createBranch(group) {
    const article = document.createElement('article');
    article.className = 'map-branch map-branch--' + group.theme;

    const title = document.createElement('h3');
    title.className = 'map-branch-title text-lg font-black';
    title.textContent = group.title;

    const description = document.createElement('p');
    description.className = 'mt-1 text-xs leading-5 text-slate-500';
    description.textContent = group.description;

    const list = document.createElement('div');
    list.className = 'map-node-list';
    list.setAttribute('role', 'list');

    group.items.forEach(topic => {
        const item = document.createElement('div');
        item.setAttribute('role', 'listitem');
        item.appendChild(createTopicButton(group, topic));
        list.appendChild(item);
    });

    article.append(title, description, list);
    return article;
}

function selectTopic(group, topic, selectedButton) {
    document.querySelectorAll('.map-node-button').forEach(button => {
        const isSelected = button === selectedButton;
        button.classList.toggle('is-active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });

    detailGroup.textContent = group.title;
    detailTitle.textContent = topic.title;
    detailSummary.textContent = topic.summary;

    detailPoints.replaceChildren();
    topic.learningPoints.forEach(point => {
        const item = document.createElement('li');
        item.className = 'flex gap-2';
        const marker = document.createElement('span');
        marker.className = 'text-indigo-500 font-bold';
        marker.textContent = '✓';
        marker.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = point;
        item.append(marker, text);
        detailPoints.appendChild(item);
    });

    detailTerms.replaceChildren();
    topic.relatedTerms.forEach(term => {
        const chip = document.createElement('span');
        chip.className = 'rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700';
        chip.textContent = term;
        detailTerms.appendChild(chip);
    });
}

function initializeLearningMap() {
    if (!Array.isArray(mapData) || mapData.length === 0) {
        branchesContainer.textContent = '學習地圖資料尚未建立。';
        detailPanel.classList.add('hidden');
        return;
    }

    mapData.forEach(group => branchesContainer.appendChild(createBranch(group)));

    const firstGroup = mapData[0];
    const firstTopic = firstGroup.items[0];
    const firstButton = document.querySelector('[data-topic-id="' + firstTopic.id + '"]');
    selectTopic(firstGroup, firstTopic, firstButton);
}

initializeLearningMap();
