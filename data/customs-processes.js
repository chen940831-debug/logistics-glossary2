// Extensible customs process template.
// Add, remove, or reorder step objects without changing the renderer.
window.CUSTOMS_PROCESS_DATA = [
    {
        id: 'export-customs',
        direction: 'export',
        title: '出口報關流程',
        summary: '示範貨物從出口前確認、文件準備、申報到放行裝運的基本階段。實際要求會依地區、貨品及運輸方式不同。',
        steps: [
            {
                stepId: 'EXP-01',
                title: '確認交易與出貨條件',
                summary: '先確認買賣雙方、交貨條件、貨物內容、目的地與預定出貨時間。',
                roles: ['shipper', 'consignee', 'forwarder'],
                documents: ['Sales Contract 或 Purchase Order', '初步貨物明細'],
                commonErrors: ['Incoterms 指定地點不完整', '貨品名稱與實際內容不一致'],
                beginnerTip: '先把誰負責運費、保險、出口與進口通關寫清楚，再安排後續作業。',
                relatedTerms: [{ label: 'Incoterms', query: 'Incoterms' }, { label: 'EXW', query: 'EXW' }, { label: 'FOB', query: 'FOB' }]
            },
            {
                stepId: 'EXP-02',
                title: '確認貨品分類與出口限制',
                summary: '依貨品材質、用途與規格確認分類，並檢查是否涉及輸出許可或其他管制。',
                roles: ['shipper', 'customs broker'],
                documents: ['產品規格資料', 'HS Code 分類參考', '輸出許可文件，如適用'],
                commonErrors: ['只依產品俗名判斷稅則分類', '未先確認管制或許可要求'],
                beginnerTip: '無法確認分類時，應提供完整規格給報關專業人員判斷。',
                relatedTerms: [{ label: 'HS Code', query: 'HS Code' }, { label: 'Customs Broker', query: 'Customs Broker' }]
            },
            {
                stepId: 'EXP-03',
                title: '準備出口文件',
                summary: '整理報關及運輸所需的商業文件，並核對文件間的品名、數量、重量與金額。',
                roles: ['shipper', 'forwarder', 'customs broker'],
                documents: ['Commercial Invoice', 'Packing List', '報關委任文件'],
                commonErrors: ['Invoice 與 Packing List 件數不同', '幣別、總價或重量漏填'],
                beginnerTip: '同一批貨在各份文件上的核心資料應保持一致。',
                relatedTerms: [{ label: 'Invoice', query: 'Invoice' }, { label: 'Packing List', query: 'Packing List' }]
            },
            {
                stepId: 'EXP-04',
                title: '訂艙、進倉或交貨',
                summary: '由承攬業者安排艙位與收貨地點，貨主依指定時間完成進倉、裝櫃或交貨。',
                roles: ['shipper', 'forwarder', 'carrier', 'warehouse'],
                documents: ['Booking Confirmation', 'Shipping Order', '進倉或收貨文件'],
                commonErrors: ['錯過進倉或截關時間', '外箱標示與文件不一致'],
                beginnerTip: '截關、截單與實際開航時間可能不同，應分別確認。',
                relatedTerms: [{ label: 'Booking', query: 'Booking' }, { label: 'Cut-off', query: 'Cut-off' }, { label: 'FCL', query: 'FCL' }, { label: 'LCL', query: 'LCL' }]
            },
            {
                stepId: 'EXP-05',
                title: '提出出口申報',
                summary: '報關業者依貨主提供的資料製作出口申報內容並送交海關審核。',
                roles: ['shipper', 'customs broker', 'customs'],
                documents: ['出口申報資料', 'Commercial Invoice', 'Packing List', '許可文件，如適用'],
                commonErrors: ['申報資料與商業文件不一致', '申報時點晚於作業截止時間'],
                beginnerTip: '送出前再次確認貨名、數量、價值、產地與運輸方式。',
                relatedTerms: [{ label: 'Customs Declaration', query: 'Customs Declaration' }, { label: 'Customs Clearance', query: 'Customs Clearance' }]
            },
            {
                stepId: 'EXP-06',
                title: '海關審核、補件或查驗',
                summary: '海關可能直接審核放行，也可能要求補充資料、修正內容或安排實貨查驗。',
                roles: ['customs', 'customs broker', 'shipper', 'warehouse'],
                documents: ['補充說明或證明文件', '查驗通知，如適用', '修正申請，如適用'],
                commonErrors: ['補件回覆不完整', '查驗貨物無法及時定位'],
                beginnerTip: '保留產品型錄、規格與交易資料，可縮短補充說明時間。',
                relatedTerms: [{ label: 'Inspection', query: 'Inspection' }, { label: 'Release', query: 'Release' }]
            },
            {
                stepId: 'EXP-07',
                title: '放行與裝運',
                summary: '取得海關放行結果後，貨物進入裝機、裝船或後續出口運送階段。',
                roles: ['customs', 'forwarder', 'carrier', 'warehouse'],
                documents: ['放行資訊', '裝運確認資料'],
                commonErrors: ['未確認放行即安排後續作業', '航班或船期異動未同步相關人員'],
                beginnerTip: '海關放行與貨物已實際裝運是兩個不同狀態。',
                relatedTerms: [{ label: 'Release', query: 'Release' }, { label: 'ETD', query: 'ETD' }]
            },
            {
                stepId: 'EXP-08',
                title: '取得運輸文件並保存紀錄',
                summary: '裝運後核對提單資料，向相關人員提供文件，並保存申報及交易紀錄。',
                roles: ['shipper', 'forwarder', 'carrier', 'consignee'],
                documents: ['B/L 或 AWB', '出口申報與放行紀錄', '費用文件'],
                commonErrors: ['提單資料錯誤未及時更正', '文件版本分散或保存不完整'],
                beginnerTip: '建立每票貨物的文件清單，統一保存最終版本。',
                relatedTerms: [{ label: 'B/L', query: 'B/L' }, { label: 'AWB', query: 'AWB' }, { label: 'MAWB', query: 'MAWB' }]
            }
        ]
    },
    {
        id: 'import-customs',
        direction: 'import',
        title: '進口報關流程',
        summary: '示範貨物從到貨前審查、取得運輸文件、申報繳稅到放行提領的基本階段。實際要求會依地區、貨品及運輸方式不同。',
        steps: [
            {
                stepId: 'IMP-01',
                title: '到貨前確認進口資格與限制',
                summary: '在貨物出運前確認進口人資格、貨品分類、產地、用途及可能的輸入管制。',
                roles: ['consignee', 'shipper', 'customs broker'],
                documents: ['產品規格資料', '交易文件', '輸入許可文件，如適用'],
                commonErrors: ['貨物抵達後才確認輸入限制', '進口人資料或資格不完整'],
                beginnerTip: '管制貨品應在出貨前完成許可確認，避免到港後產生倉租。',
                relatedTerms: [{ label: 'Importer', query: 'Importer' }, { label: 'HS Code', query: 'HS Code' }]
            },
            {
                stepId: 'IMP-02',
                title: '取得到貨與運輸文件',
                summary: '確認預計到貨時間，取得到貨通知、提單及承運人要求的相關資料。',
                roles: ['consignee', 'forwarder', 'carrier'],
                documents: ['Arrival Notice', 'B/L 或 AWB', '運輸相關通知'],
                commonErrors: ['未確認提單放貨方式', '到貨通知的收貨人資料不正確'],
                beginnerTip: '先確認正本提單、電放或其他放貨方式，避免影響提貨。',
                relatedTerms: [{ label: 'Arrival Notice', query: 'Arrival Notice' }, { label: 'B/L', query: 'B/L' }, { label: 'AWB', query: 'AWB' }]
            },
            {
                stepId: 'IMP-03',
                title: '整理申報與估價資料',
                summary: '整理交易價格、運費、保險及其他調整項目，並核對貨品分類與產地。',
                roles: ['consignee', 'customs broker', 'forwarder'],
                documents: ['Commercial Invoice', 'Packing List', '運費與保險資料', '產地證明，如適用'],
                commonErrors: ['漏列應計入的費用', '產地、數量或金額與文件不一致'],
                beginnerTip: '報關價格不一定只看 Invoice 總額，應由專業人員確認計算範圍。',
                relatedTerms: [{ label: 'Customs Value', query: 'Customs Value' }, { label: 'CIF', query: 'CIF' }, { label: 'Certificate of Origin', query: 'Certificate of Origin' }]
            },
            {
                stepId: 'IMP-04',
                title: '提出進口申報',
                summary: '報關業者依文件與進口人確認資料，製作進口申報內容並送交海關。',
                roles: ['consignee', 'customs broker', 'customs'],
                documents: ['進口申報資料', 'Commercial Invoice', 'Packing List', 'B/L 或 AWB', '許可文件，如適用'],
                commonErrors: ['申報欄位與附件不一致', '文件未齊全即送出申報'],
                beginnerTip: '申報前應完成文件版本確認，避免重複修正延誤放行。',
                relatedTerms: [{ label: 'Customs Declaration', query: 'Customs Declaration' }, { label: 'Customs Clearance', query: 'Customs Clearance' }]
            },
            {
                stepId: 'IMP-05',
                title: '審核稅費與繳納',
                summary: '依海關核定內容確認關稅、營業稅或其他應納費用，並依程序完成繳納。',
                roles: ['customs', 'customs broker', 'consignee'],
                documents: ['稅費繳納資料', '海關核定或繳款資訊'],
                commonErrors: ['未預留稅費付款時間', '把關稅與承運人費用混為同一項目'],
                beginnerTip: '事先估算稅費只供準備資金，仍應以海關核定結果為準。',
                relatedTerms: [{ label: 'Duty', query: 'Duty' }, { label: 'Tax', query: 'Tax' }]
            },
            {
                stepId: 'IMP-06',
                title: '補件、修正或貨物查驗',
                summary: '海關可能要求補充交易、規格或許可資料，也可能安排實貨查驗。',
                roles: ['customs', 'customs broker', 'consignee', 'warehouse'],
                documents: ['補充證明文件', '查驗通知，如適用', '修正申請，如適用'],
                commonErrors: ['補件資料與原申報矛盾', '未安排人員配合查驗'],
                beginnerTip: '收到補件或查驗通知時，先確認期限、地點與負責人。',
                relatedTerms: [{ label: 'Inspection', query: 'Inspection' }, { label: 'Customs', query: 'Customs' }]
            },
            {
                stepId: 'IMP-07',
                title: '放行與提領貨物',
                summary: '完成海關程序並取得放行後，再依承運人、倉庫或場站規定辦理提貨。',
                roles: ['customs', 'consignee', 'forwarder', 'carrier', 'warehouse'],
                documents: ['放行資訊', '提貨文件', '承運人費用結清資料'],
                commonErrors: ['取得海關放行但未完成承運人放貨', '提貨安排晚於免費保管期限'],
                beginnerTip: '海關放行與承運人放貨需分別確認，兩者完成後才能順利提領。',
                relatedTerms: [{ label: 'Release', query: 'Release' }, { label: 'Delivery Order', query: 'Delivery Order' }, { label: 'Demurrage', query: 'Demurrage' }]
            },
            {
                stepId: 'IMP-08',
                title: '核對費用並保存進口紀錄',
                summary: '完成提貨後核對報關、運輸及場站費用，保存申報、繳稅與交易文件。',
                roles: ['consignee', 'customs broker', 'forwarder'],
                documents: ['進口申報與放行紀錄', '稅費憑證', '運輸及場站費用文件'],
                commonErrors: ['未保存最終申報版本', '沒有追蹤後續更正或退補稅事項'],
                beginnerTip: '以每票貨物建立完整檔案，並記錄後續調整與承辦人。',
                relatedTerms: [{ label: 'Duty', query: 'Duty' }, { label: 'Freight', query: 'Freight' }, { label: 'Surcharge', query: 'Surcharge' }]
            }
        ]
    }
];
