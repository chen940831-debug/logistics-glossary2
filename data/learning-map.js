// MVP demo data.
// Add another object to a group's items array to extend the learning map.
window.LEARNING_MAP_DATA = [
    {
        id: 'customs',
        title: '報關流程',
        description: '掌握貨物從準備、申報到海關放行的主要階段。',
        theme: 'customs',
        items: [
            { id: 'export-process', title: '出口流程', summary: '從確認交易條件、準備貨物與文件，到出口申報、查驗及裝運的基本順序。', learningPoints: ['確認出口人與報關委任關係', '準備商業發票與裝箱單', '完成出口申報並追蹤放行結果'], relatedTerms: ['Exporter', 'Customs Declaration', 'Release'] },
            { id: 'import-process', title: '進口流程', summary: '從貨物抵達、取得到貨文件，到進口申報、稅費處理、查驗與提領的基本順序。', learningPoints: ['確認進口人資格與貨物限制', '核對到貨通知及運輸文件', '完成申報、繳稅與提領'], relatedTerms: ['Importer', 'Duty', 'Customs Clearance'] },
            { id: 'air-process', title: '空運流程', summary: '了解空運訂艙、收貨、安檢、報關、裝機、抵達與提貨之間的關係。', learningPoints: ['區分 MAWB 與 HAWB', '掌握截關及航班時間', '留意安檢與危險品規定'], relatedTerms: ['MAWB', 'HAWB', 'Air Cargo'] },
            { id: 'sea-process', title: '海運流程', summary: '了解海運訂艙、進倉、裝櫃、報關、裝船、到港與提櫃的主要階段。', learningPoints: ['區分整櫃與併櫃運輸', '理解提單與放貨方式', '留意延滯費及碼頭作業時間'], relatedTerms: ['FCL', 'LCL', 'B/L', 'Demurrage'] }
        ]
    },
    {
        id: 'documents',
        title: '文件範本',
        description: '認識物流作業常見文件、用途及製作責任。',
        theme: 'documents',
        items: [
            { id: 'invoice', title: 'Invoice', summary: '商業發票記載交易雙方、貨品、數量、單價、總價與交易條件，是報關與請款的重要依據。', learningPoints: ['核對買賣雙方資料', '確認幣別、金額與 Incoterms', '保持品名與其他文件一致'], relatedTerms: ['Commercial Invoice', 'Incoterms', 'Customs Value'] },
            { id: 'packing-list', title: 'Packing List', summary: '裝箱單記載包裝件數、重量、尺寸與內容物，協助報關、理貨及查驗。', learningPoints: ['列明每件包裝內容', '區分淨重與毛重', '核對件數及嘜頭'], relatedTerms: ['Gross Weight', 'Net Weight', 'Shipping Mark'] },
            { id: 'bill-of-lading', title: 'B/L', summary: '海運提單是承運人收受貨物後簽發的運輸文件，可記載運送條件及貨物交付方式。', learningPoints: ['核對 Shipper 與 Consignee', '確認正本或電放方式', '檢查裝船日與港口資料'], relatedTerms: ['B/L', 'Telex Release', 'Consignee'] },
            { id: 'air-waybill', title: 'AWB', summary: '空運提單記載空運貨物與運送資訊，常分為航空公司主提單及承攬業者分提單。', learningPoints: ['辨認 AWB 號碼', '區分 MAWB 與 HAWB', '核對機場及航班資訊'], relatedTerms: ['AWB', 'MAWB', 'HAWB'] },
            { id: 'customs-documents', title: '報關文件', summary: '依貨物、產地、用途與法規要求，報關時可能需要申報書、許可證、產地證明或其他附件。', learningPoints: ['先確認貨品分類', '核對主管機關要求', '保存申報及放行紀錄'], relatedTerms: ['HS Code', 'Import Permit', 'Certificate of Origin'] }
        ]
    },
    {
        id: 'terms',
        title: '名詞解釋',
        description: '依作業情境理解常用縮寫，建立跨流程的名詞關聯。',
        theme: 'terms',
        items: [
            { id: 'air-terms', title: '空運', summary: '整理航空貨運、提單、航班與機場作業常見縮寫。', learningPoints: ['先理解主提單與分提單', '辨認機場與承運人角色', '連結空運流程學習'], relatedTerms: ['AWB', 'MAWB', 'HAWB'] },
            { id: 'sea-terms', title: '海運', summary: '整理貨櫃、提單、船期、碼頭與放貨作業常見縮寫。', learningPoints: ['先區分 FCL 與 LCL', '理解提單及放貨', '連結海運流程學習'], relatedTerms: ['FCL', 'LCL', 'B/L'] },
            { id: 'charge-terms', title: '費用', summary: '整理運費、附加費、倉租與延滯費等常見費用名詞。', learningPoints: ['辨認費用產生階段', '確認計價單位', '區分承運人與場站費用'], relatedTerms: ['Freight', 'Demurrage', 'Surcharge'] },
            { id: 'clearance-terms', title: '通關', summary: '整理報關、稅則分類、查驗、放行與許可證等通關名詞。', learningPoints: ['理解 HS Code 用途', '掌握申報與放行關係', '辨認可能的管制文件'], relatedTerms: ['HS Code', 'Duty', 'Customs Clearance'] },
            { id: 'trade-terms', title: '貿易條件', summary: '整理 Incoterms 責任、風險與費用分界，協助理解買賣雙方分工。', learningPoints: ['分開理解費用與風險', '確認指定地點或港口', '搭配 Incoterms 比較表'], relatedTerms: ['EXW', 'FOB', 'CIF', 'DDP'] }
        ]
    }
];