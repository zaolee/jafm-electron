'use strict';

/* =========================================
   계좌 설정 관리
========================================= */

/**
 * 현재 ACCOUNTS 배열을 저장용 설정 객체 배열로 반환합니다.
 * @returns {Account[]}
 */
function getAccountConfig() {
  return ACCOUNTS.map(a => ({ key: a.key, label: a.label, num: a.num, type: a.type }));
}

/**
 * 저장된 계좌 설정을 ACCOUNTS에 적용합니다. 신규 계좌 추가, 삭제된 계좌 제거 포함.
 * @param {Account[]} config
 */
function applyAccountConfig(config) {
  if (!Array.isArray(config)) return;
  config.forEach(c => {
    const acc = ACCOUNTS.find(a => a.key === c.key);
    if (acc) {
      if (c.label) acc.label = c.label;
      if (c.num !== undefined) acc.num = c.num;
      if (c.type) acc.type = c.type;
    }
  });
  config.forEach(c => {
    if (!ACCOUNTS.find(a => a.key === c.key)) {
      ACCOUNTS.push({ key: c.key, label: c.label || c.key, num: c.num || '', type: c.type || 'krw' });
    }
  });
  const savedKeys = new Set(config.map(c => c.key));
  const defaultKeys = new Set(DEFAULT_ACCOUNTS.map(a => a.key));
  for (let i = ACCOUNTS.length - 1; i >= 0; i--) {
    const key = ACCOUNTS[i].key;
    if (!defaultKeys.has(key) && !savedKeys.has(key)) ACCOUNTS.splice(i, 1);
  }
}

/* =========================================
   계좌 잔액 계산
========================================= */

/**
 * 전체 거래내역을 기반으로 계좌별 현재 잔액을 계산합니다.
 * @returns {BalanceMap}
 */
function calcBalance() {
  /** @type {BalanceMap} */
  const bal = {};
  ACCOUNTS.forEach(a => bal[a.key] = INIT_BALANCE[a.key] || 0);
  transactions.forEach(tx => {
    const amt = tx.amount || 0;
    if (tx.type === '입금') bal[tx.account] = (bal[tx.account] || 0) + amt;
    else                    bal[tx.account] = (bal[tx.account] || 0) - amt;
  });
  return bal;
}

/**
 * 잔액 맵에서 원화(krw+cash) 계좌의 합계를 반환합니다.
 * @param {BalanceMap} bal
 * @returns {number}
 */
function getTotal(bal) {
  let total = 0;
  ACCOUNTS.forEach(a => {
    if (a.type === 'krw' || a.type === 'cash') total += (bal[a.key] || 0);
  });
  return total;
}

/**
 * 계좌 key로 계좌 이름을 반환합니다.
 * @param {string} key
 * @returns {string}
 */
function getAccLabel(key) {
  return ACCOUNTS.find(a => a.key === key)?.label || key;
}

/**
 * 계좌 key로 "계좌이름 - 계좌번호" 형식의 표시 문자열을 반환합니다. 번호 없으면 이름만.
 * @param {string} key
 * @returns {string}
 */
function getAccDisplay(key) {
  const a = ACCOUNTS.find(ac => ac.key === key);
  if (!a) return key;
  return a.num ? `${a.label} - ${a.num}` : a.label;
}
