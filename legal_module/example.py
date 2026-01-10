from .filing import create_filing

sample_case = {
    'case_number': '臺北地方法院114年度訴字第1234號',
    'parties': '原告：李灃祐  被告：新鑫公司',
    'court': '臺灣臺北地方法院',
    'claims': '請求確認本票債權不存在，並請求返還不當得利新台幣1,000,000元。',
    'facts': '原告與被告簽署車輛分期契約，惟車輛自始未交付，卻遭告提出票據裁定……',
    'laws': ['民法第184條', '票據法第17條', '最高法院111年度台上字第3208號判決'],
    'evidence': [
        {'id': '乙1', 'summary': 'LINE對話紀錄，顯示告知車輛尚未交付'},
        {'id': '乙2', 'summary': '川立公司匯款憑證，顯示資金流向'}
    ],
    'attachments': [
        {'id': '附件一', 'description': '車輛分期契約影本'},
    ]
}

if __name__ == '__main__':
    create_filing(sample_case, '法律文書_起訴狀.docx', pdf_path='法律文書_起訴狀.pdf')
    print('Documents generated: 法律文書_起訴狀.docx, 法律文書_起訴狀.pdf')
