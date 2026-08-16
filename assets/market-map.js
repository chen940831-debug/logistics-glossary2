const MARKET_DATA_PATH = 'data/market-data.json';

document.addEventListener('DOMContentLoaded', loadMarketData);

async function loadMarketData() {
    try {
        let data = window.MARKET_DATA_FALLBACK;

        if (!data) {
            const response = await fetch(MARKET_DATA_PATH);
            if (!response.ok) {
                throw new Error(`Market data request failed with status ${response.status}`);
            }
            data = await response.json();
        }

        validateMarketData(data);
        renderMarketModule(data);
    } catch (error) {
        console.error('Unable to load market data:', error);
        document.getElementById('loadError').classList.remove('hidden');
    }
}

function validateMarketData(data) {
    if (!data || !Array.isArray(data.datasets) || !data.companyProfile) {
        throw new Error('Market data schema is incomplete.');
    }

    data.datasets.forEach(dataset => {
        if (!dataset.datasetId || !Array.isArray(dataset.companies) || dataset.companies.length === 0) {
            throw new Error(`Dataset is incomplete: ${dataset.datasetId || 'unknown'}`);
        }
        if (dataset.isMarketShare === true && dataset.coveragePercent !== 100) {
            throw new Error(`Market share dataset must declare 100% coverage: ${dataset.datasetId}`);
        }
    });
}

function renderMarketModule(data) {
    document.getElementById('dataFreshness').textContent = `資料更新：${data.lastUpdated}｜來源查閱：${data.accessedDate}`;
    document.getElementById('globalNotice').textContent = data.globalNotice;

    const chartSections = [
        ['internationalCharts', 'international-revenue'],
        ['taiwanCharts', 'taiwan-revenue']
    ];

    chartSections.forEach(([containerId, sectionName]) => {
        const container = document.getElementById(containerId);
        data.datasets.filter(dataset => dataset.section === sectionName).forEach(dataset => {
            const chart = createVerticalBarChart(dataset);
            chart.classList.add('market-chart-card--wide');
            container.appendChild(chart);
        });
    });

    renderCompanyProfile(data.companyProfile);
    initializeMarketSectionSwitcher();
    setupScrollBarAnimations();
}

function initializeMarketSectionSwitcher() {
    const tabs = [...document.querySelectorAll('[data-market-section]')];
    const panels = {
        international: document.getElementById('internationalPanel'),
        taiwan: document.getElementById('taiwanPanel'),
        company: document.getElementById('companyProfile')
    };

    const selectSection = sectionName => {
        tabs.forEach(tab => {
            const isSelected = tab.dataset.marketSection === sectionName;
            tab.classList.toggle('is-active', isSelected);
            tab.setAttribute('aria-selected', String(isSelected));
        });

        Object.entries(panels).forEach(([name, panel]) => {
            panel.hidden = name !== sectionName;
        });
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => selectSection(tab.dataset.marketSection));
    });
}

function createVerticalBarChart(dataset) {
    const card = document.createElement('article');
    card.className = 'market-chart-card';
    card.setAttribute('aria-labelledby', `${dataset.datasetId}-title`);

    const header = document.createElement('header');
    header.className = 'market-chart-header';

    const headingGroup = document.createElement('div');
    const title = document.createElement('h3');
    title.id = `${dataset.datasetId}-title`;
    title.textContent = dataset.title;
    const subtitle = document.createElement('p');
    subtitle.textContent = dataset.subtitle;
    headingGroup.append(title, subtitle);

    const year = document.createElement('span');
    year.className = 'market-year-badge';
    year.textContent = dataset.year;
    header.append(headingGroup, year);
    card.appendChild(header);

    const companies = [...dataset.companies].sort((a, b) => a.rank - b.rank);
    const maximum = Math.max(...companies.map(company => company.value));
    const bars = document.createElement('ol');
    bars.className = 'market-columns';
    bars.dataset.size = companies.length;
    bars.setAttribute('aria-label', `${dataset.title}，單位：${dataset.unitLabel}`);

    companies.forEach((company, index) => {
        const item = document.createElement('li');
        item.className = 'market-column-item';
        if (company.highlight) item.classList.add('is-highlighted');
        item.setAttribute('aria-label', `${company.rank}. ${company.name}，${formatDatasetValue(company.value, dataset.unit, dataset.unitLabel)}。${company.sourceNote}`);

        const plot = document.createElement('div');
        plot.className = 'market-column-plot';
        const height = Math.max((company.value / maximum) * 100, 4);
        plot.style.setProperty('--market-column-height', `${height}%`);

        const value = document.createElement('span');
        value.className = 'market-column-value';
        value.textContent = formatDatasetValue(company.value, dataset.unit, dataset.unitLabel);

        const fill = document.createElement('div');
        fill.className = 'market-column-fill';
        fill.style.setProperty('--market-column-delay', `${index * 70}ms`);
        fill.dataset.scrollBar = '';
        fill.setAttribute('aria-hidden', 'true');
        plot.append(value, fill);

        const label = document.createElement('div');
        label.className = 'market-column-label';
        const name = document.createElement('strong');
        name.textContent = `${company.rank}. ${company.name}${company.ticker ? `（${company.ticker}）` : ''}`;
        label.appendChild(name);

        const sourceNote = document.createElement('p');
        sourceNote.className = 'market-source-note';
        sourceNote.textContent = company.sourceNote;
        item.append(plot, label, sourceNote);
        bars.appendChild(item);
    });
    card.appendChild(bars);

    card.appendChild(createDatasetMeta(dataset));

    const notice = document.createElement('p');
    notice.className = 'market-notice';
    notice.textContent = dataset.notice;
    card.appendChild(notice);

    card.appendChild(createLearningBlocks(dataset.learning));
    const sources = companies.map(company => company.source).concat(dataset.sources || []);
    card.appendChild(createSourceLinks(sources));
    return card;
}

function setupScrollBarAnimations() {
    const bars = [...document.querySelectorAll('[data-scroll-bar]')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        bars.forEach(bar => bar.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -4% 0px' });

    bars.forEach(bar => observer.observe(bar));
}

function createDatasetMeta(dataset) {
    const meta = document.createElement('dl');
    meta.className = 'market-meta';
    const entries = [
        ['市場定義', dataset.marketDefinition],
        ['統計單位', dataset.unitLabel],
        ['市場市占', dataset.isMarketShare ? '是' : '否'],
        ['資料範圍', formatScopeStatus(dataset.scopeStatus)],
        ['方法說明', dataset.methodologyNote]
    ];

    entries.forEach(([label, value], index) => {
        const wrapper = document.createElement('div');
        if (index === entries.length - 1) wrapper.className = 'md:col-span-2';
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        const termLabel = document.createElement('strong');
        termLabel.textContent = label;
        term.appendChild(termLabel);
        description.textContent = value;
        wrapper.append(term, description);
        meta.appendChild(wrapper);
    });
    return meta;
}

function createLearningBlocks(learning) {
    const container = document.createElement('div');
    container.className = 'market-learning';
    const blocks = [
        ['我從這張圖要看什麼？', learning.whatToSee],
        ['這和我的工作有什麼關係？', learning.whyItMatters]
    ];

    blocks.forEach(([title, content]) => {
        const article = document.createElement('article');
        const heading = document.createElement('strong');
        const paragraph = document.createElement('p');
        heading.textContent = title;
        paragraph.textContent = content;
        article.append(heading, paragraph);
        container.appendChild(article);
    });
    return container;
}

function createSourceLinks(sources) {
    const container = document.createElement('div');
    container.className = 'market-sources';
    const uniqueSources = sources.filter((source, index, all) =>
        all.findIndex(candidate => candidate.url === source.url) === index
    );

    uniqueSources.forEach(source => {
        const link = document.createElement('a');
        link.className = 'market-source-link';
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `查看來源：${source.publisher}`;
        link.title = `${source.title}，查閱日期 ${source.accessedDate}`;
        container.appendChild(link);
    });
    return container;
}

function renderCompanyProfile(profile) {
    const section = document.getElementById('companyProfile');
    section.className = 'market-profile market-view-panel mt-8';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'market-eyebrow';
    eyebrow.textContent = 'Company Position';
    const title = document.createElement('h2');
    title.id = 'companyProfileTitle';
    title.className = 'text-2xl md:text-3xl font-black text-indigo-950';
    title.textContent = profile.title;
    section.append(eyebrow, title);

    const grid = document.createElement('div');
    grid.className = 'market-profile-grid';
    const details = document.createElement('div');
    details.appendChild(createProfileFacts(profile));

    const servicesTitle = document.createElement('h3');
    servicesTitle.className = 'mt-5 text-sm font-black text-indigo-950';
    servicesTitle.textContent = '主要服務範圍';
    const services = document.createElement('div');
    services.className = 'market-service-list';
    profile.services.forEach(service => {
        const item = document.createElement('span');
        item.textContent = service;
        services.appendChild(item);
    });

    const relationship = document.createElement('p');
    relationship.className = 'mt-4 text-xs leading-6 text-slate-600';
    relationship.textContent = profile.relationship;
    const scope = document.createElement('p');
    scope.className = 'market-scope-note';
    scope.textContent = profile.disclosureScope;
    details.append(servicesTitle, services, relationship, scope, createSourceLinks(profile.sources));

    const composition = createRevenueComposition(profile.groupRevenue);
    grid.append(details, composition);
    section.appendChild(grid);
    section.appendChild(createCompanyPresentationSummary(profile));
}

function createProfileFacts(profile) {
    const list = document.createElement('dl');
    list.className = 'market-profile-facts';
    const facts = [
        ['正式法人', profile.legalName],
        ['品牌名稱', profile.brandName],
        ['所屬集團', profile.parentGroup],
        ['台空成立', `${profile.companyFoundedYear} 年`],
        ['集團成立', `${profile.groupFoundedYear} 年`],
        ['股票代號', profile.ticker],
        ['台灣據點', `${profile.taiwanLocations.length} 處`],
        ['公開資料層級', '集團合併']
    ];

    facts.forEach(([label, value]) => {
        const item = document.createElement('div');
        item.className = 'market-profile-fact';
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = value;
        item.append(term, description);
        list.appendChild(item);
    });
    return list;
}

function createCompanyPresentationSummary(profile) {
    const presentation = profile.companyReportedPosition;
    const article = document.createElement('article');
    article.className = 'market-presentation-summary';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'market-eyebrow';
    eyebrow.textContent = 'TEC Public Presentation';
    const title = document.createElement('h3');
    title.textContent = '公司簡報揭露的營運概況';
    article.append(eyebrow, title);

    const stats = document.createElement('dl');
    stats.className = 'market-presentation-stats';
    const statItems = [
        [`${profile.companyFoundedYear}`, '台空成立年份'],
        [profile.staffSnapshot.total.toLocaleString('zh-TW'), 'TEC Group 員工'],
        [`${profile.taiwanLocations.length}`, '台灣營運據點'],
        [`${profile.networkSnapshot.globalConsolidationWarehouses}`, '全球集運倉節點']
    ];
    statItems.forEach(([value, label]) => {
        const item = document.createElement('div');
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = value;
        description.textContent = label;
        item.append(term, description);
        stats.appendChild(item);
    });
    article.appendChild(stats);

    const contentGrid = document.createElement('div');
    contentGrid.className = 'market-presentation-content';

    const capabilities = document.createElement('section');
    const capabilitiesTitle = document.createElement('h4');
    capabilitiesTitle.textContent = '簡報揭露的營運能力';
    const capabilityList = document.createElement('ul');
    capabilityList.className = 'market-operations-list';
    profile.operationalHighlights.forEach(highlight => {
        const item = document.createElement('li');
        item.textContent = highlight;
        capabilityList.appendChild(item);
    });
    const locations = document.createElement('p');
    locations.className = 'market-presentation-detail';
    locations.textContent = `台灣據點：${profile.taiwanLocations.join('、')}。`;
    capabilities.append(capabilitiesTitle, capabilityList, locations);

    const position = document.createElement('section');
    const positionTitle = document.createElement('h4');
    positionTitle.textContent = presentation.title;
    const metrics = document.createElement('div');
    metrics.className = 'market-reported-grid';
    presentation.metrics.forEach(metric => {
        const card = document.createElement('div');
        card.className = 'market-reported-card';
        const rank = document.createElement('strong');
        rank.textContent = metric.rankLabel;
        const label = document.createElement('span');
        label.textContent = metric.label;
        const value = document.createElement('small');
        value.textContent = `${metric.value.toLocaleString('zh-TW')} ${metric.unit}`;
        card.append(rank, label, value);
        metrics.appendChild(card);
    });
    const warning = document.createElement('p');
    warning.className = 'market-scope-note';
    warning.textContent = presentation.methodologyNote;
    position.append(positionTitle, metrics, warning);

    contentGrid.append(capabilities, position);
    article.appendChild(contentGrid);

    const source = document.createElement('p');
    source.className = 'market-presentation-source';
    source.textContent = `來源：${presentation.source.title}；檔名日期 ${presentation.source.fileDate}；引用投影片 ${presentation.source.slides.join('、')}。`;
    article.appendChild(source);
    return article;
}

function createRevenueComposition(revenue) {
    const article = document.createElement('article');
    article.setAttribute('aria-labelledby', 'revenueCompositionTitle');
    const title = document.createElement('h3');
    title.id = 'revenueCompositionTitle';
    title.className = 'text-sm font-black text-indigo-950 mb-4';
    title.textContent = `${revenue.year} 年台驊集團營收組成`;

    const wrap = document.createElement('div');
    wrap.className = 'market-donut-wrap';
    const donut = document.createElement('div');
    donut.className = 'market-donut';
    donut.style.background = createConicGradient(revenue.segments, revenue.total);
    donut.setAttribute('role', 'img');
    donut.setAttribute('aria-label', createRevenueAriaLabel(revenue));

    const center = document.createElement('div');
    center.className = 'market-donut-center';
    const centerValue = document.createElement('strong');
    centerValue.textContent = formatDatasetValue(revenue.total / 1000, 'TWD million');
    center.append(centerValue, document.createTextNode('集團營收'));
    donut.appendChild(center);

    const legend = document.createElement('ul');
    legend.className = 'market-donut-legend';
    revenue.segments.forEach(segment => {
        const item = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = 'market-legend-dot';
        dot.style.backgroundColor = segment.color;
        const name = document.createElement('span');
        name.textContent = segment.name;
        const value = document.createElement('strong');
        value.textContent = `${formatPercent(segment.value / revenue.total)}%`;
        item.append(dot, name, value);
        legend.appendChild(item);
    });

    wrap.append(donut, legend);
    const notice = document.createElement('p');
    notice.className = 'market-notice';
    notice.textContent = revenue.notice;
    article.append(title, wrap, notice);
    return article;
}

function createConicGradient(segments, total) {
    let current = 0;
    const stops = segments.map(segment => {
        const start = current;
        current += (segment.value / total) * 100;
        return `${segment.color} ${start.toFixed(3)}% ${current.toFixed(3)}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
}

function createRevenueAriaLabel(revenue) {
    const segments = revenue.segments.map(segment =>
        `${segment.name} ${formatPercent(segment.value / revenue.total)}%`
    );
    return `${revenue.year} 年台驊集團營收組成：${segments.join('、')}。`;
}

function formatDatasetValue(value, unit, unitLabel = unit) {
    if (unit === 'TWD million') {
        return `NT$ ${value.toLocaleString('zh-TW', { maximumFractionDigits: 1 })} 百萬元`;
    }
    if (unit === 'USD billion') {
        return `US$ ${value.toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} 十億`;
    }
    return `${Math.round(value).toLocaleString('zh-TW')} ${unitLabel}`;
}

function formatScopeStatus(status) {
    const labels = {
        'selected-company-sample': '已核對公司樣本',
        'selected-public-companies': '已核對公開公司樣本',
        'mixed-group-and-segment': '集團與事業部混合樣本'
    };
    return labels[status] || status;
}

function formatPercent(value) {
    return (value * 100).toLocaleString('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
