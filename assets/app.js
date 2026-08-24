// Load the file-compatible data script first, with JSON kept as the HTTP fallback.
let dictionary = [];

// Global State variables
let currentCategory = 'ALL';
let currentIncoGroup = 'ALL';
let currentView = 'cards';
let bookmarks = JSON.parse(localStorage.getItem('logistics_bookmarks') || '[]');
let showingOnlyBookmarks = false;
let fcIndex = 0;
let isFcFlipped = false;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const terms = Array.isArray(window.LOGISTICS_TERMS)
            ? window.LOGISTICS_TERMS
            : await loadTermsFromJson();
        if (!Array.isArray(terms)) {
            throw new Error('詞條資料格式不正確');
        }

        dictionary = terms;
        updateBookmarkCount();
        const initialQuery = new URLSearchParams(window.location.search).get('search');
        if (initialQuery) {
            document.getElementById('searchInput').value = initialQuery;
            handleSearch();
        } else {
            showGlossaryPrompt();
        }
        renderMatrixTable();
        initFlashcard();
    } catch (error) {
        console.error('無法載入詞條資料：', error);
        const emptyState = document.getElementById('emptyState');
        document.getElementById('browsePrompt')?.classList.add('hidden');
        emptyState.querySelector('p').textContent = '詞條資料載入失敗';
        emptyState.classList.remove('hidden');
    }
});

async function loadTermsFromJson() {
    const response = await fetch('data/terms.json');
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

// View Switcher logic
function switchView(view) {
    currentView = view;
    const searchSection = document.getElementById('searchControlsSection');
    const viewCards = document.getElementById('viewCards');
    const viewMatrix = document.getElementById('viewMatrix');
    const viewFlashcards = document.getElementById('viewFlashcards');

    // Update the shared view controls without replacing their base classes.
    ['Cards', 'Matrix', 'Flashcards'].forEach(v => {
        const btn = document.getElementById(`tabBtn${v}`);
        const isSelected = v.toLowerCase() === view;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });

    // Toggle view visibilities
    if (view === 'cards') {
        searchSection.classList.remove('hidden');
        viewCards.classList.remove('hidden');
        viewMatrix.classList.add('hidden');
        viewFlashcards.classList.add('hidden');
    } else if (view === 'matrix') {
        searchSection.classList.add('hidden');
        viewCards.classList.add('hidden');
        viewMatrix.classList.remove('hidden');
        viewFlashcards.classList.add('hidden');
    } else if (view === 'flashcards') {
        searchSection.classList.add('hidden');
        viewCards.classList.add('hidden');
        viewMatrix.classList.add('hidden');
        viewFlashcards.classList.remove('hidden');
        initFlashcard();
    }
}

// Category & Group Filters
function filterCategory(category, targetButton) {
    currentCategory = category;
    currentIncoGroup = 'ALL';
    showingOnlyBookmarks = false;

    // UI Button Toggles
    document.querySelectorAll('.category-btn').forEach(btn => {
        const isSelected = btn === targetButton;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });

    // Show/Hide Incoterms subgroup
    const incoSub = document.getElementById('incotermsSubgroup');
    if (category === 'Incoterms') {
        incoSub.classList.remove('hidden');
    } else {
        incoSub.classList.add('hidden');
    }

    handleSearch();
}

function filterIncotermGroup(group, targetButton) {
    currentIncoGroup = group;
    document.querySelectorAll('.incogroup-btn').forEach(btn => {
        const isSelected = btn === targetButton;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
    handleSearch();
}

function toggleBookmarkFilter() {
    showingOnlyBookmarks = !showingOnlyBookmarks;
    const btn = document.getElementById('bookmarkFilterBtn');
    btn.classList.toggle('is-active', showingOnlyBookmarks);
    btn.setAttribute('aria-pressed', String(showingOnlyBookmarks));
    handleSearch();
}

function revealGlossary() {
    switchView('cards');
    document.getElementById('glossary').scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
    });
}

function searchCommonTerm(query) {
    currentCategory = 'ALL';
    currentIncoGroup = 'ALL';
    showingOnlyBookmarks = false;

    document.querySelectorAll('.category-btn').forEach((btn, index) => {
        const isSelected = index === 0;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
    document.querySelectorAll('.incogroup-btn').forEach((btn, index) => {
        const isSelected = index === 0;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
    document.getElementById('incotermsSubgroup').classList.add('hidden');

    const bookmarkButton = document.getElementById('bookmarkFilterBtn');
    bookmarkButton.classList.remove('is-active');
    bookmarkButton.setAttribute('aria-pressed', 'false');

    document.getElementById('searchInput').value = query;
    handleSearch();
    revealGlossary();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    handleSearch();
}

function showGlossaryPrompt() {
    document.getElementById('resultsContainer').innerHTML = '';
    document.getElementById('resultsSummary').textContent = '';
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('browsePrompt').classList.remove('hidden');
}

function browseAllTerms() {
    currentCategory = 'ALL';
    currentIncoGroup = 'ALL';
    showingOnlyBookmarks = false;
    document.getElementById('searchInput').value = '';

    document.querySelectorAll('.category-btn').forEach((btn, index) => {
        const isSelected = index === 0;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
    document.querySelectorAll('.incogroup-btn').forEach((btn, index) => {
        const isSelected = index === 0;
        btn.classList.toggle('is-active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });
    document.getElementById('incotermsSubgroup').classList.add('hidden');

    const bookmarkButton = document.getElementById('bookmarkFilterBtn');
    bookmarkButton.classList.remove('is-active');
    bookmarkButton.setAttribute('aria-pressed', 'false');

    renderCards(dictionary);
    revealGlossary();
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const clearBtn = document.getElementById('clearSearchBtn');

    if (query.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    const filtered = dictionary.filter(item => {
        // Category match
        const matchCategory = (currentCategory === 'ALL' || item.category === currentCategory);

        // Incoterm Group match
        const matchIncoGroup = (currentIncoGroup === 'ALL' || item.incoGroup === currentIncoGroup);

        // Bookmark filter match
        const matchBookmark = !showingOnlyBookmarks || bookmarks.includes(item.code);

        // Query Search match
        const matchQuery = item.code.toLowerCase().includes(query) ||
                           item.fullName.toLowerCase().includes(query) ||
                           item.zhName.toLowerCase().includes(query) ||
                           item.explanation.toLowerCase().includes(query) ||
                           (item.scenario && item.scenario.toLowerCase().includes(query));

        return matchCategory && matchIncoGroup && matchBookmark && matchQuery;
    });

    renderCards(filtered);
}

function renderCards(data = dictionary) {
    const container = document.getElementById('resultsContainer');
    const emptyState = document.getElementById('emptyState');
    const resultsSummary = document.getElementById('resultsSummary');

    document.getElementById('browsePrompt').classList.add('hidden');
    resultsSummary.textContent = `${data.length} 個名詞`;

    if (data.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = data.map(item => {
        const isBookmarked = bookmarks.includes(item.code);
        return `
        <article class="term-card">
            <div class="term-card-header">
                <div>
                    <span class="term-card-code">${item.code}</span>
                    <span class="term-card-category">${getCategoryLabel(item.category)}${item.incoGroup ? ` · ${item.incoGroup} 組` : ''}</span>
                </div>
                <button
                    type="button"
                    onclick="toggleBookmark('${item.code}')"
                    class="term-bookmark ${isBookmarked ? 'is-bookmarked' : ''}"
                    aria-label="${isBookmarked ? '取消收藏' : '收藏'} ${item.code}"
                    title="${isBookmarked ? '取消收藏' : '加入收藏'}"
                >收藏</button>
            </div>
            <h3>${item.fullName}</h3>
            <p class="term-card-zh">${item.zhName}</p>
            <p class="term-card-summary">${item.explanation}</p>
            <div class="term-card-footer">
                <button type="button" onclick="openDetailModal('${item.code}')" class="term-detail-button">
                    查看完整說明 <span aria-hidden="true">→</span>
                </button>
            </div>
        </article>
    `;
    }).join('');
}

function renderMatrixTable() {
    const incoTerms = dictionary.filter(d => d.category === 'Incoterms');
    const tbody = document.getElementById('matrixTableBody');

    tbody.innerHTML = incoTerms.map(item => `
        <tr class="hover:bg-indigo-50/50 transition cursor-pointer" onclick="openDetailModal('${item.code}')">
            <td class="p-3 font-black text-indigo-950 border-b border-slate-200">
                <div class="text-sm">${item.code}</div>
                <div class="text-[10px] text-slate-500 font-normal">${item.fullName}</div>
            </td>
            <td class="p-3 border-b border-slate-200 font-semibold text-slate-700">
                ${item.incoGroup}組
            </td>
            <td class="p-3 border-b border-slate-200 text-[11px] text-slate-700 leading-tight">
                ${item.riskTransfer}
            </td>
            <td class="p-3 border-b border-slate-200 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.exportCustoms.includes('賣方') ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}">
                    ${item.exportCustoms}
                </span>
            </td>
            <td class="p-3 border-b border-slate-200 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.importCustoms.includes('賣方') ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}">
                    ${item.importCustoms}
                </span>
            </td>
            <td class="p-3 border-b border-slate-200 text-center text-[11px]">
                ${item.freight}
            </td>
            <td class="p-3 border-b border-slate-200 text-center text-[11px]">
                ${item.insurance}
            </td>
            <td class="p-3 border-b border-slate-200 text-[10px] text-slate-600">
                ${item.transportDoc}
            </td>
            <td class="p-3 border-b border-slate-200 text-[10px] text-slate-600">
                ${item.otherDoc}
            </td>
            <td class="p-3 border-b border-slate-200 text-[10px] font-medium text-indigo-900">
                ${item.mode}
            </td>
        </tr>
    `).join('');
}

function openDetailModal(code) {
    const item = dictionary.find(d => d.code === code);
    if (!item) return;

    const modalBody = document.getElementById('modalDetailBody');
    const isBookmarked = bookmarks.includes(item.code);

    if (item.category === 'Incoterms') {
        modalBody.innerHTML = `
            <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-3xl font-black text-indigo-950">${item.code}</h2>
                        <span class="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">${item.incoGroup}組 · ${item.zhName}</span>
                    </div>
                    <p class="text-xs text-slate-500 font-medium mt-1">${item.fullName}</p>
                </div>
                <button onclick="toggleBookmark('${item.code}')" class="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    <svg class="w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    ${isBookmarked ? '已收藏' : '加入收藏'}
                </button>
            </div>

            <!-- Risk Transfer Focus Banner -->
            <div class="bg-indigo-950 text-white p-4 rounded-2xl mb-5 shadow-inner">
                <div class="text-xs text-indigo-300 font-bold mb-1 flex items-center gap-1.5">
                    📍 風險移轉點 (Risk Transfer Point)：
                </div>
                <p class="text-xs md:text-sm leading-relaxed text-indigo-50 font-medium">
                    ${item.riskTransfer}
                </p>
            </div>

            <!-- Details Matrix Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-xs">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px] mb-0.5">出口通關</span>
                    <span class="font-bold text-slate-800">${item.exportCustoms}</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px] mb-0.5">進口通關</span>
                    <span class="font-bold text-slate-800">${item.importCustoms}</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px] mb-0.5">國際運費負擔</span>
                    <span class="font-bold text-slate-800">${item.freight}</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span class="text-slate-400 block text-[10px] mb-0.5">保險費負擔</span>
                    <span class="font-bold text-slate-800">${item.insurance}</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span class="text-slate-400 block text-[10px] mb-0.5">適用運輸工具</span>
                    <span class="font-bold text-indigo-900">${item.mode}</span>
                </div>
            </div>

            <div class="space-y-4 text-xs">
                <div>
                    <h4 class="font-bold text-slate-900 mb-1">📄 運送與保險單據責任</h4>
                    <p class="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">${item.transportDoc}</p>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 mb-1">💡 條規詳細解釋</h4>
                    <p class="text-slate-600 leading-relaxed">${item.explanation}</p>
                </div>
                <div>
                    <h4 class="font-bold text-slate-900 mb-1">💬 實務應用情境</h4>
                    <p class="text-slate-600 bg-amber-50 text-amber-950 p-3 rounded-xl border border-amber-200/80">${item.scenario}</p>
                </div>
            </div>
        `;
    } else {
        // General/Sea/Air/Charges Detail
        modalBody.innerHTML = `
            <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-3xl font-black text-indigo-950">${item.code}</h2>
                        <span class="bg-indigo-100 text-indigo-900 text-xs px-2.5 py-0.5 rounded-full font-bold">${getCategoryLabel(item.category)}</span>
                    </div>
                    <p class="text-xs text-slate-500 font-medium mt-1">${item.fullName}</p>
                </div>
                <button onclick="toggleBookmark('${item.code}')" class="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    <svg class="w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    ${isBookmarked ? '已收藏' : '加入收藏'}
                </button>
            </div>

            <div class="mb-4">
                <span class="inline-block bg-indigo-50 text-indigo-900 text-sm px-3 py-1 rounded-lg font-bold border border-indigo-100 mb-3">
                    ${item.zhName}
                </span>
                <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    ${item.explanation}
                </p>
            </div>

            ${Array.isArray(item.childTerms) && item.childTerms.length ? `
            <div class="mt-4 border-t border-slate-200 pt-4">
                <h4 class="font-bold text-sm text-slate-900 mb-2">相關子類型</h4>
                <div class="flex flex-wrap gap-2">
                    ${item.childTerms.map(childCode => `
                        <button type="button" onclick="openDetailModal('${childCode}')" class="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-indigo-900 hover:border-indigo-500 hover:bg-indigo-50">
                            ${childCode}
                        </button>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${item.scenario ? `
            <div class="mt-4">
                <h4 class="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1">
                    💬 實際職場溝通範例：
                </h4>
                <p class="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                    ${item.scenario}
                </p>
            </div>
            ` : ''}
        `;
    }

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function initFlashcard() {
    fcIndex = 0;
    isFcFlipped = false;
    updateFlashcardUI();
}

function flipFlashcard() {
    const inner = document.getElementById('flashcardInner');
    isFcFlipped = !isFcFlipped;
    if (isFcFlipped) {
        inner.classList.add('rotate-y-180');
    } else {
        inner.classList.remove('rotate-y-180');
    }
}

function updateFlashcardUI() {
    const inner = document.getElementById('flashcardInner');
    inner.classList.remove('rotate-y-180');
    isFcFlipped = false;

    const item = dictionary[fcIndex];
    document.getElementById('fcCategory').innerText = getCategoryLabel(item.category);
    document.getElementById('fcCode').innerText = item.code;
    document.getElementById('fcFullName').innerText = item.fullName;

    document.getElementById('fcBackCode').innerText = item.code;
    document.getElementById('fcBackZh').innerText = item.zhName;
    document.getElementById('fcBackDesc').innerText = item.explanation;
    document.getElementById('fcBackScenario').innerText = item.scenario || item.riskTransfer || "無特定範例";

    document.getElementById('fcCounter').innerText = `${fcIndex + 1} / ${dictionary.length}`;
}

function nextFlashcard() {
    fcIndex = (fcIndex + 1) % dictionary.length;
    updateFlashcardUI();
}

function prevFlashcard() {
    fcIndex = (fcIndex - 1 + dictionary.length) % dictionary.length;
    updateFlashcardUI();
}

// Bookmark Handler
function toggleBookmark(code) {
    if (bookmarks.includes(code)) {
        bookmarks = bookmarks.filter(c => c !== code);
        showToast(`已從收藏中移除 [${code}]`);
    } else {
        bookmarks.push(code);
        showToast(`已成功收藏 [${code}]`);
    }
    localStorage.setItem('logistics_bookmarks', JSON.stringify(bookmarks));
    updateBookmarkCount();
    handleSearch();

    // If detail modal is currently open, refresh it
    const modal = document.getElementById('detailModal');
    if (!modal.classList.contains('hidden')) {
        openDetailModal(code);
    }
}

function updateBookmarkCount() {
    document.getElementById('bookmarkCount').innerText = bookmarks.length;
}

// Category Badge Utilities
function getCategoryBadgeClass(category) {
    switch(category) {
        case 'Incoterms': return 'bg-amber-100 text-amber-900 border border-amber-200';
        case 'Sea': return 'bg-blue-100 text-blue-900 border border-blue-200';
        case 'Air': return 'bg-sky-100 text-sky-900 border border-sky-200';
        case 'Charges': return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
        default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
}

function getCategoryLabel(category) {
    switch(category) {
        case 'Incoterms': return '國貿條規';
        case 'Sea': return '海運';
        case 'Air': return '空運';
        case 'Charges': return '運費附加費';
        default: return '通關與一般';
    }
}

// Modal Controls
function openModal() {
    resetReportStatus();
    document.getElementById('reportModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('reportModal').classList.add('hidden');
    document.getElementById('reportForm').reset();
    resetReportStatus();
}

function resetReportStatus() {
    const status = document.getElementById('reportStatus');
    status.textContent = '';
    status.className = 'hidden text-xs rounded-xl px-3 py-2';
}

async function submitReport(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitButton = document.getElementById('reportSubmitBtn');
    const status = document.getElementById('reportStatus');

    submitButton.disabled = true;
    submitButton.textContent = '傳送中...';
    status.textContent = '正在安全傳送回報，請稍候。';
    status.className = 'block text-xs rounded-xl px-3 py-2 bg-indigo-50 text-indigo-800 border border-indigo-200';

    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)).toString()
        });

        if (!response.ok) {
            throw new Error(`Netlify Forms HTTP ${response.status}`);
        }

        closeModal();
        showToast('回報已送達 Netlify Forms，感謝你的協助！');
    } catch (error) {
        status.textContent = '回報未能送出，請確認網路連線後再試一次。';
        status.className = 'block text-xs rounded-xl px-3 py-2 bg-red-50 text-red-800 border border-red-200';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '送出回報';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3000);
}
