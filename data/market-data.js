window.MARKET_DATA_FALLBACK = {
    schemaVersion: '1.0.0',
    moduleId: 'logistics-market-map',
    title: '物流產業版圖',
    lastUpdated: '2026-08-15',
    accessedDate: '2026-08-15',
    datasets: [
        {
            datasetId: 'taiwan-listed-logistics-revenue-2025',
            section: 'taiwan-revenue',
            title: '台灣公開資訊可觀察之物流集團營收比較',
            subtitle: '2025 年合併營業收入',
            year: 2025,
            marketDefinition: '具公開財務資料之台灣物流集團合併營業收入',
            unit: 'TWD million',
            unitLabel: '新台幣百萬元',
            isMarketShare: false,
            coveragePercent: null,
            chartType: 'ranked-bar',
            scopeStatus: 'selected-public-companies',
            methodologyNote: '比較公開財務資料中的 2025 年合併營業收入。各集團的地理範圍、子公司及空運、海運、倉儲等業務組成不同，且未涵蓋所有未上市業者。',
            notice: '公開資訊可觀察之規模比較，非完整台灣貨運承攬市場市占率。',
            companies: [
                {
                    name: '中菲行國際物流',
                    ticker: '5609',
                    value: 29681.087,
                    rank: 1,
                    sourceNote: '2025 年經查核合併營業收入。',
                    source: {
                        publisher: '中菲行國際物流股份有限公司',
                        title: '2025 年年報',
                        url: 'https://tw.dimerco.com/wp-content/uploads/sites/7/2026/06/4.-114%E5%B9%B4%E5%B9%B4%E5%A0%B1.pdf',
                        publishedDate: '2026-06',
                        accessedDate: '2026-08-15'
                    }
                },
                {
                    name: '台驊國際控股',
                    ticker: '2636',
                    value: 20793.603,
                    rank: 2,
                    highlight: true,
                    sourceNote: '2025 年經查核合併營業收入，屬台驊集團層級。',
                    source: {
                        publisher: '台驊國際控股股份有限公司',
                        title: '2025 年合併財務報告',
                        url: 'https://www.t3ex-group.com/files/Finance/114%20CHN.pdf',
                        publishedDate: '2026',
                        accessedDate: '2026-08-15'
                    }
                },
                {
                    name: '捷迅',
                    ticker: '2643',
                    value: 8398.72,
                    rank: 3,
                    sourceNote: '2025 年累計合併營收；公開資訊彙整頁資料，後續更新時應再與年報核對。',
                    source: {
                        publisher: '公開資訊彙整頁（資料源為公司月營收公告）',
                        title: '捷迅 2025 年度合併營收',
                        url: 'https://goodinfo.tw/tw/StockFinDetail.asp?LAST_RPT_CAT=IS_M_YEAR&QRY_TIME=2025&RPT_CAT=IS_M_YEAR&STOCK_ID=2643',
                        publishedDate: '2026',
                        accessedDate: '2026-08-15'
                    }
                }
            ],
            learning: {
                whatToSee: '此圖只比較三家具有公開資料的物流集團合併營收。營收較高可能來自服務組合、海外子公司或運價變化，不能直接解讀為台灣貨運承攬市占。',
                whyItMatters: '新人可藉此辨認台灣資本市場中較容易取得公開資料的國際物流集團，並理解公司層級與集團層級數字的差別。'
            }
        }
    ],
    companyProfile: {
        id: 'taiwan-express-t3ex',
        title: '台灣空運國際物流／台驊集團定位',
        legalName: '台灣航空貨運承攬股份有限公司',
        brandName: 'Taiwan Express／台灣空運國際物流',
        parentGroup: '台驊國際控股股份有限公司',
        parentGroupEnglish: 'T3EX Global Holdings Corp.',
        ticker: '2636',
        groupFoundedYear: 1984,
        companyFoundedYear: 1992,
        taiwanLocations: ['基隆', '台北', '桃園', '桃園機場', '新竹', '台中', '高雄'],
        staffSnapshot: {
            total: 596,
            taiwan: 382,
            overseas: 214,
            scope: 'TEC Group',
            asOf: '2026-08'
        },
        networkSnapshot: {
            globalConsolidationWarehouses: 9,
            regions: ['美國', '加拿大', '英國', '歐盟', '中國', '香港', '澳洲', '日本', '韓國']
        },
        operationalHighlights: [
            '桃園航空貨運站作業辦公室與專用裝卸區',
            '距桃園國際機場約 4.6 公里的倉儲設施',
            '自有一般、保稅、冷藏及氣墊車輛',
            '空運、海運、報關、倉儲、陸運與供應鏈整合',
            '跨境電商集運、包裹加值處理、退貨與逆物流',
            'ERP、WMS 與 SCM 客製化資訊服務'
        ],
        companyReportedPosition: {
            title: '公司簡報自述營運規模與排名',
            metrics: [
                { label: '報關服務', rankLabel: 'Top 1', value: 18000, unit: '票／月' },
                { label: '空運出口承攬', rankLabel: 'Top 10', value: 1000, unit: '公噸／月' },
                { label: '空運進口承攬', rankLabel: 'Top 10', value: 3000, unit: '票／月' },
                { label: '海運貨運承攬', rankLabel: 'Top 20', value: 1000, unit: 'TEU／月' }
            ],
            methodologyNote: '公司簡報未註明排名市場範圍、統計年份、研究單位或計算方法。以下內容僅標示為公司簡報自述，不視為已獨立查核的台灣市場排名。',
            source: {
                title: 'TEC Presentation_ 202608 (English)',
                fileDate: '2026-08',
                slides: [7, 12, 13, 14, 17, 18, 33, 35]
            }
        },
        relationship: '台驊集團於 2010 年取得台灣航空貨運承攬股份有限公司 100% 股權。',
        disclosureScope: '公開財務數據為台驊集團合併層級，不能解讀為台灣空運單一公司的營收或市場占有率。',
        services: ['空運', '海運', '報關', '倉儲', '陸運', '跨境物流'],
        groupRevenue: {
            year: 2025,
            unit: 'TWD thousand',
            unitLabel: '新台幣千元',
            total: 20793603,
            segments: [
                { name: '海運事業', value: 12644598, color: '#1e3a8a' },
                { name: '空運事業', value: 5783857, color: '#4f46e5' },
                { name: '其他事業', value: 2365148, color: '#d97706' }
            ],
            isMarketShare: false,
            notice: '台驊集團 2025 年營收組成，非台灣物流市場市占率。'
        },
        sources: [
            {
                publisher: '台驊國際控股股份有限公司',
                title: '集團大事紀',
                url: 'https://www.t3ex-group.com/About/History',
                accessedDate: '2026-08-15'
            },
            {
                publisher: '台灣航空貨運承攬股份有限公司',
                title: 'Taiwan Express 官方網站',
                url: 'https://tec.t3ex-tec.com/',
                accessedDate: '2026-08-15'
            },
            {
                publisher: '台驊國際控股股份有限公司',
                title: '2025 年合併財務報告',
                url: 'https://www.t3ex-group.com/files/Finance/114%20CHN.pdf',
                accessedDate: '2026-08-15'
            }
        ]
    },
    globalNotice: '目前頁面只比較中菲行、台驊與捷迅三家公開合併營收；此比較不代表完整台灣貨運承攬市場市占率。'
};
