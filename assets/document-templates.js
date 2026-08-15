const documentTemplates = window.DOCUMENT_TEMPLATE_DATA;
const documentTabs = document.getElementById('documentTabs');
const documentEnglishName = document.getElementById('documentEnglishName');
const documentChineseName = document.getElementById('documentChineseName');
const documentAbbreviation = document.getElementById('documentAbbreviation');
const documentPurpose = document.getElementById('documentPurpose');
const documentWhenUsed = document.getElementById('documentWhenUsed');
const documentPreviewFields = document.getElementById('documentPreviewFields');
const documentFieldExplanations = document.getElementById('documentFieldExplanations');
const documentErrors = document.getElementById('documentErrors');
const documentAbbreviations = document.getElementById('documentAbbreviations');

function selectField(fieldId) {
    document.querySelectorAll('[data-field-id]').forEach(element => {
        element.classList.toggle('is-active', element.dataset.fieldId === fieldId);
    });
}

function createPreviewField(field) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'document-preview-field';
    button.dataset.fieldId = field.fieldId;
    button.setAttribute('aria-label', '查看欄位說明：' + field.label);
    button.addEventListener('click', () => selectField(field.fieldId));

    const label = document.createElement('span');
    label.className = 'document-preview-label';
    label.textContent = field.label;

    const value = document.createElement('span');
    value.className = 'document-preview-value';
    value.textContent = field.sampleValue;

    button.append(label, value);
    return button;
}

function createFieldExplanation(field) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'document-field-explanation';
    button.dataset.fieldId = field.fieldId;
    button.addEventListener('click', () => selectField(field.fieldId));

    const label = document.createElement('span');
    label.className = 'block text-xs font-black text-indigo-900';
    label.textContent = field.label;

    const description = document.createElement('span');
    description.className = 'block mt-1 text-xs leading-5 text-slate-600';
    description.textContent = field.description;

    button.append(label, description);
    return button;
}

function renderFields(fields) {
    documentPreviewFields.replaceChildren();
    documentFieldExplanations.replaceChildren();

    fields.forEach(field => {
        documentPreviewFields.appendChild(createPreviewField(field));
        documentFieldExplanations.appendChild(createFieldExplanation(field));
    });

    if (fields.length > 0) {
        selectField(fields[0].fieldId);
    }
}

function renderErrors(errors) {
    documentErrors.replaceChildren();

    errors.forEach(error => {
        const item = document.createElement('li');
        item.className = 'flex gap-2';
        const marker = document.createElement('span');
        marker.className = 'font-black';
        marker.textContent = '×';
        marker.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = error;
        item.append(marker, text);
        documentErrors.appendChild(item);
    });
}

function renderAbbreviations(abbreviations) {
    documentAbbreviations.replaceChildren();

    abbreviations.forEach(abbreviation => {
        const link = document.createElement('a');
        link.className = 'document-term-link';
        link.href = 'index.html?search=' + encodeURIComponent(abbreviation.query);
        link.textContent = abbreviation.label;
        link.setAttribute('aria-label', '在名詞查詢頁搜尋 ' + abbreviation.label);
        documentAbbreviations.appendChild(link);
    });
}

function renderDocument(documentTemplate) {
    documentEnglishName.textContent = documentTemplate.englishName;
    documentChineseName.textContent = documentTemplate.chineseName;
    documentAbbreviation.textContent = documentTemplate.abbreviation;
    documentPurpose.textContent = documentTemplate.purpose;
    documentWhenUsed.textContent = documentTemplate.whenUsed;
    renderFields(documentTemplate.fields);
    renderErrors(documentTemplate.commonErrors);
    renderAbbreviations(documentTemplate.relatedAbbreviations);
}

function selectDocument(documentId) {
    const selectedDocument = documentTemplates.find(documentTemplate => documentTemplate.id === documentId);
    if (!selectedDocument) return;

    document.querySelectorAll('.document-tab').forEach(button => {
        const isSelected = button.dataset.documentId === documentId;
        button.classList.toggle('is-active', isSelected);
        button.setAttribute('aria-selected', String(isSelected));
        button.tabIndex = isSelected ? 0 : -1;
    });

    renderDocument(selectedDocument);
}

function createDocumentTabs() {
    documentTemplates.forEach((documentTemplate, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'document-tab';
        button.dataset.documentId = documentTemplate.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', 'false');
        button.setAttribute('aria-controls', 'documentPanel');
        button.tabIndex = index === 0 ? 0 : -1;
        button.addEventListener('click', () => selectDocument(documentTemplate.id));

        const englishName = document.createElement('span');
        englishName.className = 'block text-sm font-black truncate';
        englishName.textContent = documentTemplate.englishName;

        const chineseName = document.createElement('span');
        chineseName.className = 'block mt-1 text-xs text-slate-500';
        chineseName.textContent = documentTemplate.chineseName;

        button.append(englishName, chineseName);
        documentTabs.appendChild(button);
    });
}

function initializeDocumentTemplates() {
    if (!Array.isArray(documentTemplates) || documentTemplates.length === 0) {
        documentTabs.textContent = '文件範本資料尚未建立。';
        document.getElementById('documentPanel').classList.add('hidden');
        return;
    }

    createDocumentTabs();

    const requestedDocument = new URLSearchParams(window.location.search).get('document');
    const initialDocument = documentTemplates.some(item => item.id === requestedDocument)
        ? requestedDocument
        : documentTemplates[0].id;

    selectDocument(initialDocument);
}

initializeDocumentTemplates();
