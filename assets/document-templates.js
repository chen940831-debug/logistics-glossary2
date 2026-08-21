const documentViewer = document.getElementById('documentViewer');
const documentTabs = document.getElementById('documentTabs');
const documentStage = document.getElementById('documentStage');
const documentFrameShell = document.getElementById('documentFrameShell');
const documentFrame = document.getElementById('documentFrame');
const zoomLevel = document.getElementById('zoomLevel');
const documentPosition = document.getElementById('documentPosition');
const openPreview = document.getElementById('openPreview');
const downloadDocument = document.getElementById('downloadDocument');

let templates = [];
let activeIndex = 0;
let previewZoom = 1;

function createElement(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
}

function normalizedIndex(index) {
    if (!templates.length) return 0;
    return (index + templates.length) % templates.length;
}

function setZoom(nextZoom) {
    previewZoom = Math.min(1.75, Math.max(0.75, nextZoom));
    documentFrameShell.style.setProperty('--preview-zoom', String(previewZoom));
    zoomLevel.value = `${Math.round(previewZoom * 100)}%`;
    zoomLevel.textContent = zoomLevel.value;
    window.requestAnimationFrame(() => {
        documentStage.scrollLeft = Math.max(0, (documentStage.scrollWidth - documentStage.clientWidth) / 2);
    });
}

function fitViewer() {
    setZoom(window.matchMedia('(max-width: 640px)').matches ? 0.75 : 1);
}

function renderFields(fields) {
    const list = document.getElementById('documentFields');
    list.replaceChildren(...fields.map(field => createElement('li', '', field)));
}

function updateTabs() {
    documentTabs.querySelectorAll('.document-tab').forEach((button, index) => {
        const selected = index === activeIndex;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
    });
}

function updateAddress(template) {
    const url = new URL(window.location.href);
    url.searchParams.set('document', template.id);
    window.history.replaceState({}, '', url);
}

function renderDocument(index, updateUrl = true) {
    if (!templates.length) return;
    activeIndex = normalizedIndex(index);
    const template = templates[activeIndex];

    documentFrame.title = `${template.title} 文件預覽`;
    documentFrame.src = template.previewPath ? `${template.previewPath}#toolbar=0&navpanes=0&zoom=page-width` : 'about:blank';
    documentStage.classList.toggle('is-unavailable', !template.previewPath);
    documentPosition.textContent = `${activeIndex + 1} / ${templates.length}`;
    openPreview.href = template.previewPath || template.filePath;
    downloadDocument.href = template.filePath;
    downloadDocument.download = template.filePath.split('/').pop();

    document.getElementById('viewerMeta').textContent = `${template.category.toUpperCase()} · ${template.abbreviation}`;
    document.getElementById('viewerTitle').textContent = template.title;
    document.getElementById('viewerChineseTitle').textContent = template.chineseTitle;
    document.getElementById('documentPurpose').textContent = template.purpose;
    document.getElementById('documentWhenUsed').textContent = template.whenUsed;
    renderFields(template.fields);
    updateTabs();
    if (updateUrl) updateAddress(template);
}

function createTabs() {
    documentTabs.replaceChildren(...templates.map((template, index) => {
        const button = createElement('button', 'document-tab');
        button.type = 'button';
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', 'documentStage');
        button.addEventListener('click', () => renderDocument(index));
        button.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                documentTabs.children[normalizedIndex(index + 1)].focus();
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                documentTabs.children[normalizedIndex(index - 1)].focus();
            }
        });

        const abbreviation = createElement('span', 'document-tab-abbreviation', template.abbreviation);
        const name = createElement('span', 'document-tab-name', template.chineseTitle);
        button.append(abbreviation, name);
        return button;
    }));
}

function changeDocument(direction) {
    renderDocument(activeIndex + direction);
}

async function toggleFullscreen() {
    const fullscreenButton = document.getElementById('toggleFullscreen');
    if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
    }
    if (documentViewer.requestFullscreen) {
        await documentViewer.requestFullscreen();
        return;
    }
    const expanded = documentViewer.classList.toggle('is-expanded');
    document.body.classList.toggle('viewer-expanded', expanded);
    fullscreenButton.setAttribute('aria-pressed', String(expanded));
}

async function initializeDocumentTemplates() {
    try {
        const response = await fetch('data/document-templates.json');
        if (!response.ok) throw new Error('Document template index unavailable');
        const index = await response.json();
        templates = index.templates;
    } catch (error) {
        templates = Array.isArray(window.DOCUMENT_TEMPLATE_FALLBACK) ? window.DOCUMENT_TEMPLATE_FALLBACK : [];
    }

    if (!templates.length) {
        documentViewer.textContent = '文件範本資料尚未建立。';
        return;
    }

    createTabs();
    const requestedId = new URLSearchParams(window.location.search).get('document');
    const requestedIndex = templates.findIndex(template => template.id === requestedId);
    renderDocument(requestedIndex >= 0 ? requestedIndex : 0, false);
    fitViewer();
}

document.getElementById('previousDocument').addEventListener('click', () => changeDocument(-1));
document.getElementById('nextDocument').addEventListener('click', () => changeDocument(1));
document.getElementById('stagePrevious').addEventListener('click', () => changeDocument(-1));
document.getElementById('stageNext').addEventListener('click', () => changeDocument(1));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(previewZoom - 0.25));
document.getElementById('zoomIn').addEventListener('click', () => setZoom(previewZoom + 0.25));
document.getElementById('fitWidth').addEventListener('click', fitViewer);
document.getElementById('toggleFullscreen').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
    document.getElementById('toggleFullscreen').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
});

document.addEventListener('keydown', event => {
    if (event.target.closest('iframe, a, button')) return;
    if (event.key === 'ArrowLeft') changeDocument(-1);
    if (event.key === 'ArrowRight') changeDocument(1);
    if (event.key === '+' || event.key === '=') setZoom(previewZoom + 0.25);
    if (event.key === '-') setZoom(previewZoom - 0.25);
});

initializeDocumentTemplates();
