// constants/bankInfo.js
export const BANK_INFO = {
  // Thông tin ngân hàng chính để nhận thanh toán
  PRIMARY_BANK: {
    bankCode: '963388', // Mã ngân hàng Timo
    bankName: 'Ngân hàng số Timo by BV Bank (Timo)',
    bankShortName: 'Timo',
    accountNumber: '0328028026', // Số tài khoản Timo
    accountName: 'MAI VAN HUNG', // Tên chủ tài khoản
    branch: 'Timo Digital Bank' // Optional
  },
  
  // Format cho VietQR
  getVietQrBankCode: (bankShortName) => {
    const codes = {
      'VCB': '970436',
      'VietinBank': '970415',
      'BIDV': '970418',
      'Agribank': '970405',
      'Techcombank': '970407',
      'MBBank': '970422',
      'ACB': '970416',
      'TPBank': '970423',
      'Sacombank': '970403',
      'Timo': '963388'
    };
    return codes[bankShortName] || bankShortName;
  }
};

export default BANK_INFO;
