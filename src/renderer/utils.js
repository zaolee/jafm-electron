'use strict';

/* =========================================
   XSS helper
========================================= */

/**
 * HTML 특수문자를 이스케이프합니다. XSS 방지용.
 * @param {*} s
 * @returns {string}
 */
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* =========================================
   날짜/숫자 포맷
========================================= */

/**
 * 'YYYY-MM-DD' → 'YYYY/MM/DD'
 * @param {string} d
 * @returns {string}
 */
function fmtDate(d) {
  if (!d) return '';
  return d.replace(/-/g, '/');
}

/**
 * 원화 금액을 포맷합니다. 음수는 빨간색 스팬으로 반환.
 * @param {number|null|undefined|''} n
 * @returns {string} HTML 문자열
 */
function fmtKrw(n) {
  if (n === null || n === undefined || n === '') return '-';
  const num = Number(n);
  if (isNaN(num) || num === 0) return '-';
  if (num < 0) return '<span style="color:#c8321a;font-weight:700;">▼ ₩ ' + Math.abs(num).toLocaleString('ko-KR') + '</span>';
  return '₩ ' + num.toLocaleString('ko-KR');
}

/**
 * 달러 금액을 포맷합니다. 음수는 빨간색 스팬으로 반환.
 * @param {number|null|undefined} n
 * @returns {string} HTML 문자열
 */
function fmtUsd(n) {
  if (!n || n === 0) return '-';
  const num = Number(n);
  if (num < 0) return '<span style="color:#c8321a;font-weight:700;">▼ $ ' + Math.abs(num).toFixed(2) + '</span>';
  return '$ ' + Math.abs(num).toFixed(2);
}

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환합니다.
 * @returns {string}
 */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 콤마 포함 금액 문자열을 숫자로 변환합니다.
 * @param {string} str
 * @returns {number}
 */
function parseAmount(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
}

/**
 * getElementById로 input/select 요소의 value를 안전하게 반환합니다.
 * @param {string} id
 * @returns {string}
 */
function getVal(id) {
  return (/** @type {HTMLInputElement} */ (document.getElementById(id)))?.value ?? '';
}

/**
 * getElementById로 input/select 요소의 value를 설정합니다.
 * @param {string} id
 * @param {string} value
 */
function setVal(id, value) {
  const el = /** @type {HTMLInputElement} */ (document.getElementById(id));
  if (el) el.value = value;
}

/**
 * 금액 입력 필드에 콤마 포맷을 적용합니다. oninput 핸들러용.
 * @param {HTMLInputElement} el
 */
function formatAmountInput(el) {
  const raw = el.value.replace(/[^0-9.]/g, '');
  const num = parseFloat(raw);
  if (!isNaN(num) && raw !== '') {
    el.value = num.toLocaleString('ko-KR');
  } else {
    el.value = raw;
  }
}
