'use strict';

/**
 * @typedef {{ id: string, date: string, account: string, type: '입금'|'출금', amount: number, desc: string, note: string }} Transaction
 * @typedef {{ key: string, label: string, num: string, type: 'krw'|'usd'|'cash' }} Account
 * @typedef {Object.<string, number>} BalanceMap
 * @typedef {{ name1: string, name2: string }} ApprovalNames
 */

/* =========================================
   전역 상태
========================================= */

/** @type {Account[]} */
const DEFAULT_ACCOUNTS = [];

/** @type {Account[]} */
let ACCOUNTS = DEFAULT_ACCOUNTS.map(a => ({ ...a }));

/** @type {ApprovalNames} */
let APPROVAL_NAMES = { name1: '담당', name2: '이사' };

/** @type {BalanceMap} */
const DEFAULT_BALANCE = {};

/** @type {BalanceMap} */
let INIT_BALANCE = { ...DEFAULT_BALANCE };

/** @type {Transaction[]} */
let transactions = [];

/** @type {boolean} Electron IPC vs 브라우저 localStorage 자동 선택 */
const isElectron = typeof window.electronAPI !== 'undefined';
