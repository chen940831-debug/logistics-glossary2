// Training-only document templates.
// All preview values are fictional placeholders. Add new documents without changing the renderer.
window.DOCUMENT_TEMPLATE_DATA = [
    {
        id: 'commercial-invoice',
        chineseName: '商業發票',
        englishName: 'Commercial Invoice',
        abbreviation: 'C/I',
        category: 'commercial',
        purpose: '記載交易雙方、貨品、數量、價格與交易條件，作為報關、請款及核對交易內容的重要文件。',
        whenUsed: '通常在出口報關、進口報關、買賣雙方請款及銀行文件審查時使用。',
        commonErrors: ['買賣雙方名稱或地址不完整', '品名過於籠統，無法辨認實際貨物', '幣別、單價與總價計算不一致', 'Incoterms 未寫指定地點或港口'],
        relatedAbbreviations: [{ label: 'C/I', query: 'C/I' }, { label: 'FOB', query: 'FOB' }, { label: 'CIF', query: 'CIF' }],
        fields: [
            { fieldId: 'ci-number', label: 'Invoice Number', sampleValue: 'SAMPLE-CI-0001', description: '出口人用來識別此筆交易的發票編號。' },
            { fieldId: 'ci-date', label: 'Invoice Date', sampleValue: '20XX-01-15', description: '發票開立日期，應與交易及出貨時程相符。' },
            { fieldId: 'ci-exporter', label: 'Exporter / Seller', sampleValue: 'SAMPLE EXPORT CO., LTD.', description: '出口人或賣方的完整名稱與聯絡資料。' },
            { fieldId: 'ci-consignee', label: 'Consignee / Buyer', sampleValue: 'DEMO IMPORT LLC', description: '收貨人或買方的完整名稱與聯絡資料。' },
            { fieldId: 'ci-terms', label: 'Trade Terms', sampleValue: 'FOB SAMPLE PORT', description: '交易條件及指定地點，例如 FOB 後面應標示指定裝運港。' },
            { fieldId: 'ci-goods', label: 'Description of Goods', sampleValue: 'TRAINING PRODUCT A', description: '具體描述貨物名稱、材質、型號或用途。' },
            { fieldId: 'ci-quantity', label: 'Quantity', sampleValue: '10 CARTONS', description: '交易數量及計量單位。' },
            { fieldId: 'ci-amount', label: 'Unit Price / Total', sampleValue: 'USD XX.XX / USD XXX.XX', description: '單價、總價與幣別。本頁數字僅為教學佔位。' }
        ]
    },
    {
        id: 'packing-list',
        chineseName: '裝箱單',
        englishName: 'Packing List',
        abbreviation: 'P/L',
        category: 'commercial',
        purpose: '說明每件包裝的內容、件數、重量、尺寸與外箱標示，供報關、理貨、倉儲及查驗使用。',
        whenUsed: '通常在出口文件準備、報關申報、貨物進倉、海關查驗及收貨點交時使用。',
        commonErrors: ['件數與 Commercial Invoice 不一致', '淨重與毛重欄位填反', '包裝尺寸或總體積漏填', '外箱嘜頭與實際貨物不一致'],
        relatedAbbreviations: [{ label: 'P/L', query: 'P/L' }, { label: 'FCL', query: 'FCL' }, { label: 'LCL', query: 'LCL' }],
        fields: [
            { fieldId: 'pl-number', label: 'Packing List Number', sampleValue: 'SAMPLE-PL-0001', description: '裝箱單編號，通常可與發票或訂單建立對應。' },
            { fieldId: 'pl-exporter', label: 'Exporter', sampleValue: 'SAMPLE EXPORT CO., LTD.', description: '出口人或出貨方資料。' },
            { fieldId: 'pl-consignee', label: 'Consignee', sampleValue: 'DEMO IMPORT LLC', description: '收貨人資料，應與其他出貨文件核對。' },
            { fieldId: 'pl-packages', label: 'Number of Packages', sampleValue: '10 CARTONS', description: '總包裝件數及包裝類型。' },
            { fieldId: 'pl-marks', label: 'Shipping Marks', sampleValue: 'SAMPLE MARK 01-10', description: '外箱或包裝上的識別標示。' },
            { fieldId: 'pl-goods', label: 'Contents', sampleValue: 'TRAINING PRODUCT A', description: '各包裝內的貨物內容與數量。' },
            { fieldId: 'pl-weight', label: 'Net / Gross Weight', sampleValue: 'XX.XX KG / XX.XX KG', description: '淨重不含包裝，毛重包含包裝。' },
            { fieldId: 'pl-size', label: 'Dimensions', sampleValue: 'XX × XX × XX CM', description: '單件或各包裝尺寸，可用於計算體積。' }
        ]
    },
    {
        id: 'air-waybill',
        chineseName: '空運貨運單',
        englishName: 'Air Waybill',
        abbreviation: 'AWB',
        category: 'transport',
        purpose: '記載航空貨物的託運人、收貨人、起訖機場、件數、重量及運送資訊，作為空運承運與貨物追蹤文件。',
        whenUsed: '貨物交由航空公司或航空貨運承攬業者運送時使用，常見主提單 MAWB 與分提單 HAWB。',
        commonErrors: ['Shipper 或 Consignee 資料不完整', '起運與目的機場代碼填錯', '毛重與計費重量混淆', '貨物品名與報關文件不一致'],
        relatedAbbreviations: [{ label: 'MAWB', query: 'MAWB' }, { label: 'HAWB', query: 'HAWB' }, { label: 'CW / CHW', query: 'CW / CHW' }],
        fields: [
            { fieldId: 'awb-number', label: 'AWB Number', sampleValue: 'XXX-XXXXXXXX (SAMPLE)', description: '空運貨運單識別號碼。本頁格式為無效教學佔位。' },
            { fieldId: 'awb-shipper', label: 'Shipper', sampleValue: 'SAMPLE EXPORT CO., LTD.', description: '空運託運人名稱與聯絡資料。' },
            { fieldId: 'awb-consignee', label: 'Consignee', sampleValue: 'DEMO IMPORT LLC', description: '目的地收貨人名稱與聯絡資料。' },
            { fieldId: 'awb-origin', label: 'Airport of Departure', sampleValue: 'AAA / SAMPLE ORIGIN', description: '起運機場代碼與名稱，本頁使用無效代碼。' },
            { fieldId: 'awb-destination', label: 'Airport of Destination', sampleValue: 'BBB / SAMPLE DESTINATION', description: '目的機場代碼與名稱，本頁使用無效代碼。' },
            { fieldId: 'awb-pieces', label: 'Number of Pieces', sampleValue: '10 PCS', description: '交運貨物件數。' },
            { fieldId: 'awb-weight', label: 'Gross / Chargeable Weight', sampleValue: 'XX.XX KG / XX.XX KG', description: '毛重與航空運費採用的計費重量。' },
            { fieldId: 'awb-goods', label: 'Nature and Quantity of Goods', sampleValue: 'TRAINING CARGO ONLY', description: '貨物性質、數量及必要的處理資訊。' }
        ]
    },
    {
        id: 'bill-of-lading',
        chineseName: '海運提單',
        englishName: 'Bill of Lading',
        abbreviation: 'B/L',
        category: 'transport',
        purpose: '記載海運貨物、承運安排與交付資訊，並依提單形式處理目的港放貨。',
        whenUsed: '貨物以海運方式運送時使用，可能由船公司或海運承攬業者簽發主提單或分提單。',
        commonErrors: ['Shipper、Consignee 或 Notify Party 資料錯誤', '裝貨港與卸貨港填反', '正本提單與電放方式未確認', '貨物件數、重量或櫃號與其他文件不一致'],
        relatedAbbreviations: [{ label: 'B/L', query: 'B/L' }, { label: 'MBL', query: 'MBL' }, { label: 'HBL', query: 'HBL' }],
        fields: [
            { fieldId: 'bl-number', label: 'B/L Number', sampleValue: 'SAMPLE-BL-0001', description: '提單識別編號。本頁編號僅供教學。' },
            { fieldId: 'bl-shipper', label: 'Shipper', sampleValue: 'SAMPLE EXPORT CO., LTD.', description: '提單記載的託運人。' },
            { fieldId: 'bl-consignee', label: 'Consignee', sampleValue: 'DEMO IMPORT LLC', description: '提單記載的收貨人或指示抬頭。' },
            { fieldId: 'bl-notify', label: 'Notify Party', sampleValue: 'DEMO NOTIFY PARTY', description: '貨物到港時應通知的對象。' },
            { fieldId: 'bl-vessel', label: 'Vessel / Voyage', sampleValue: 'DEMO VESSEL / VOY. XX', description: '船名及航次。本頁使用虛構名稱。' },
            { fieldId: 'bl-pol', label: 'Port of Loading', sampleValue: 'SAMPLE PORT A', description: '貨物裝船港。' },
            { fieldId: 'bl-pod', label: 'Port of Discharge', sampleValue: 'SAMPLE PORT B', description: '貨物卸船港。' },
            { fieldId: 'bl-cargo', label: 'Packages and Goods', sampleValue: '10 CARTONS / TRAINING CARGO', description: '包裝件數、貨物描述、重量及相關標示。' }
        ]
    }
];
