'use strict';

/* =========================================
   초기잔액 로드/저장
========================================= */

/**
 * 초기잔액·계좌설정·결재란 이름을 로드하여 전역 상태에 적용합니다.
 * Electron에서는 IPC, 브라우저에서는 localStorage를 사용합니다.
 * @returns {Promise<void>}
 */
function loadInitBalance() {
  function applyLoaded({ _accountConfig, _approvalNames, ...balanceData }) {
    if (Array.isArray(_accountConfig)) {
      INIT_BALANCE = { ...balanceData };
      ACCOUNTS = _accountConfig.map(c => ({
        key: c.key, label: c.label || c.key, num: c.num || '', type: c.type || 'krw',
      }));
    } else {
      INIT_BALANCE = { ...DEFAULT_BALANCE, ...balanceData };
    }
    if (_approvalNames) Object.assign(APPROVAL_NAMES, _approvalNames);
  }

  if (isElectron) {
    return window.electronAPI.loadInitBalance().then(res => {
      if (res.ok && res.data) applyLoaded(res.data);
    });
  } else {
    try {
      const raw = localStorage.getItem('jafm_init_balance');
      if (raw) applyLoaded(JSON.parse(raw));
    } catch(e) {}
    return Promise.resolve();
  }
}

/**
 * 현재 초기잔액·계좌설정·결재란 이름을 저장합니다.
 */
function saveInitBalance() {
  const data = { ...INIT_BALANCE, _accountConfig: getAccountConfig(), _approvalNames: APPROVAL_NAMES };
  if (isElectron) {
    window.electronAPI.saveInitBalance(data);
  } else {
    localStorage.setItem('jafm_init_balance', JSON.stringify(data));
  }
}

/* =========================================
   거래내역 로드/저장
========================================= */
/**
 * 거래내역을 로드하여 `transactions` 전역 배열에 채웁니다.
 * @returns {Promise<void>}
 */
async function loadData() {
  if (isElectron) {
    const res = await window.electronAPI.loadTransactions();
    transactions = res.ok ? (res.data || []) : [];
  } else {
    try {
      const raw = localStorage.getItem('jafm_transactions');
      if (raw) transactions = JSON.parse(raw);
    } catch(e) { transactions = []; }
  }
}

/**
 * 현재 `transactions` 배열을 저장합니다.
 */
function saveData() {
  if (isElectron) {
    window.electronAPI.saveTransactions(transactions);
  } else {
    localStorage.setItem('jafm_transactions', JSON.stringify(transactions));
  }
}
