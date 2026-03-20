'use strict';

/* =========================================
   은행 컬럼 안내 모달 데이터
========================================= */
const BANK_MODAL_INFO = {
  ibk: {
    name: '기업은행 (IBK)',
    steps: [
      'IBK기업은행 인터넷뱅킹 로그인',
      '조회/이체 → <strong>거래내역조회</strong>',
      '조회 기간 설정 후 검색',
      '우측 상단 <strong>엑셀저장</strong> 버튼 클릭',
    ],
    cols: [
      { name: '거래일시',       role: 'date',  ex: '2026-03-18 09:15:00', desc: '거래 날짜 및 시각' },
      { name: '출금',           role: 'out',   ex: '2,671,995',           desc: '출금 금액 (원)' },
      { name: '입금',           role: 'in',    ex: '55,000,000',          desc: '입금 금액 (원)' },
      { name: '거래후 잔액',    role: 'bal',   ex: '1,048,971,207',       desc: '거래 후 잔액' },
      { name: '거래내용',       role: 'desc',  ex: '(주)대화프라스틱',    desc: '거래 내용 / 거래처명' },
      { name: '상대계좌번호',   role: 'skip',  ex: '110-123-456789',      desc: '상대방 계좌번호 (미사용)' },
      { name: '상대은행',       role: 'skip',  ex: '신한은행',            desc: '상대방 은행 (미사용)' },
      { name: '메모',           role: 'skip',  ex: '',                    desc: '메모 (미사용)' },
    ],
  },
  nh: {
    name: '농협은행 (NH)',
    steps: [
      'NH농협 인터넷뱅킹 로그인',
      '조회 → <strong>거래내역조회</strong>',
      '기간 설정 후 조회',
      '<strong>내보내기</strong> → <strong>엑셀</strong> 선택',
    ],
    cols: [
      { name: '거래일자',    role: 'date', ex: '2026.03.05',   desc: '거래 날짜' },
      { name: '거래시각',    role: 'skip', ex: '09:12:33',     desc: '거래 시각 (미사용)' },
      { name: '내용',        role: 'desc', ex: '결산용잔액증명', desc: '거래 내용' },
      { name: '찾으신금액',  role: 'out',  ex: '500',          desc: '출금 금액 (원)' },
      { name: '맡기신금액',  role: 'in',   ex: '0',            desc: '입금 금액 (원)' },
      { name: '잔액',        role: 'bal',  ex: '2,865,888',    desc: '거래 후 잔액' },
      { name: '거래점명',    role: 'skip', ex: '서울지점',     desc: '거래 지점 (미사용)' },
    ],
  },
  woori: {
    name: '우리은행',
    steps: [
      '우리은행 WON뱅킹 또는 인터넷뱅킹 로그인',
      '조회 → <strong>거래내역조회</strong>',
      '기간 설정 후 조회',
      '하단 <strong>파일저장 → Excel</strong> 클릭',
    ],
    cols: [
      { name: '거래일',    role: 'date', ex: '2026/03/03',  desc: '거래 날짜' },
      { name: '시간',      role: 'skip', ex: '11:22:00',    desc: '거래 시각 (미사용)' },
      { name: '거래내용',  role: 'desc', ex: '계좌결산',    desc: '거래 내용' },
      { name: '출금액',    role: 'out',  ex: '1,000',       desc: '출금 금액 (원)' },
      { name: '입금액',    role: 'in',   ex: '1,000',       desc: '입금 금액 (원)' },
      { name: '잔액',      role: 'bal',  ex: '346',         desc: '거래 후 잔액' },
      { name: '거래점',    role: 'skip', ex: '강남점',      desc: '거래 지점 (미사용)' },
    ],
  },
  kb: {
    name: '국민은행 (KB)',
    steps: [
      'KB국민은행 인터넷뱅킹 로그인',
      '조회 → <strong>입출금내역</strong>',
      '기간 및 계좌 선택 후 조회',
      '우측 상단 <strong>엑셀 다운로드</strong> 클릭',
    ],
    cols: [
      { name: '거래일시',  role: 'date', ex: '2026-03-04 09:00', desc: '거래 날짜 및 시각' },
      { name: '내용',      role: 'desc', ex: 'BC카드선결제',     desc: '거래 내용' },
      { name: '출금',      role: 'out',  ex: '2,671,995',        desc: '출금 금액 (원)' },
      { name: '입금',      role: 'in',   ex: '33,000,000',       desc: '입금 금액 (원)' },
      { name: '잔액',      role: 'bal',  ex: '985,243,107',      desc: '거래 후 잔액' },
      { name: '메모',      role: 'skip', ex: '',                 desc: '사용자 메모 (미사용)' },
    ],
  },
  shinhan: {
    name: '신한은행',
    steps: [
      '신한 SOL뱅크 또는 인터넷뱅킹 로그인',
      '조회 → <strong>거래내역조회</strong>',
      '기간 선택 후 조회',
      '<strong>엑셀 저장</strong> 버튼 클릭',
    ],
    cols: [
      { name: '거래일자',   role: 'date', ex: '20260305',      desc: '거래 날짜 (YYYYMMDD)' },
      { name: '거래시각',   role: 'skip', ex: '153022',         desc: '거래 시각 (미사용)' },
      { name: '거래내용',   role: 'desc', ex: '급여이체',       desc: '거래 내용' },
      { name: '출금금액',   role: 'out',  ex: '0',              desc: '출금 금액 (원)' },
      { name: '입금금액',   role: 'in',   ex: '4,651,900',      desc: '입금 금액 (원)' },
      { name: '잔액',       role: 'bal',  ex: '1,052,000,000',  desc: '거래 후 잔액' },
    ],
  },
  auto: {
    name: '자동 감지',
    steps: [
      '어느 은행이든 상관없이 파일을 올리면 자동으로 판별합니다',
      '단, 인식이 안 될 경우 <strong>정확한 은행을 직접 선택</strong>하세요',
    ],
    cols: [
      { name: '날짜 관련 컬럼',  role: 'date', ex: '거래일자 / 거래일 / 거래일시', desc: '이 중 하나를 날짜로 자동 인식' },
      { name: '내용 관련 컬럼',  role: 'desc', ex: '적요 / 내용 / 거래내용',       desc: '이 중 하나를 거래내용으로 인식' },
      { name: '출금 관련 컬럼',  role: 'out',  ex: '출금금액 / 찾으신금액 / 출금', desc: '이 중 하나를 출금으로 인식' },
      { name: '입금 관련 컬럼',  role: 'in',   ex: '입금금액 / 맡기신금액 / 입금', desc: '이 중 하나를 입금으로 인식' },
      { name: '잔액 관련 컬럼',  role: 'bal',  ex: '잔액 / 잔고',                  desc: '거래 후 잔액' },
    ],
  },
};

const ROLE_CLASS = {
  date: 'role-date', desc: 'role-desc',
  in: 'role-in', out: 'role-out',
  bal: 'role-bal', skip: 'role-skip',
};
const ROLE_LABEL = {
  date: '날짜', desc: '내용/적요',
  in: '입금', out: '출금',
  bal: '잔액', skip: '참고(미사용)',
};

/* =========================================
   은행별 컬럼 매핑 스키마
========================================= */
const BANK_SCHEMAS = {
  ibk: {
    name: '기업은행',
    dateKeys:    ['거래일시', '거래일자', '날짜', '거래일'],
    timeKeys:    [],
    descKeys:    ['거래내용', '적요', '내용', '거래적요'],
    outKeys:     ['출금', '출금금액', '출금액', '찾으신금액'],
    inKeys:      ['입금', '입금금액', '입금액', '맡기신금액'],
    balKeys:     ['거래후잔액', '잔액', '잔고'],
  },
  nh: {
    name: '농협은행',
    dateKeys:    ['거래일자', '거래일'],
    timeKeys:    ['거래시각', '거래시간'],
    descKeys:    ['내용', '적요', '거래내용'],
    outKeys:     ['찾으신금액', '출금금액', '출금액'],
    inKeys:      ['맡기신금액', '입금금액', '입금액'],
    balKeys:     ['잔액'],
  },
  woori: {
    name: '우리은행',
    dateKeys:    ['거래일', '거래일자'],
    timeKeys:    ['시간', '거래시간'],
    descKeys:    ['거래내용', '적요', '내용'],
    outKeys:     ['출금액', '출금금액'],
    inKeys:      ['입금액', '입금금액'],
    balKeys:     ['잔액'],
  },
  kb: {
    name: '국민은행',
    dateKeys:    ['거래일시', '거래일자', '거래일'],
    timeKeys:    [],
    descKeys:    ['내용', '거래내용', '적요'],
    outKeys:     ['출금', '출금금액', '출금액'],
    inKeys:      ['입금', '입금금액', '입금액'],
    balKeys:     ['잔액'],
  },
  shinhan: {
    name: '신한은행',
    dateKeys:    ['거래일자', '거래일'],
    timeKeys:    ['거래시각', '거래시간'],
    descKeys:    ['거래내용', '내용', '적요'],
    outKeys:     ['출금금액', '출금액'],
    inKeys:      ['입금금액', '입금액'],
    balKeys:     ['잔액'],
  },
  auto: null,
};

/* =========================================
   모달
========================================= */
let currentModalBank = 'ibk';

function openColModal() {
  const sel = /** @type {HTMLSelectElement} */ (document.getElementById('import-bank')).value;
  currentModalBank = sel;
  renderColModal(currentModalBank);
  document.getElementById('colModal').classList.add('open');
}

function closeColModal() {
  document.getElementById('colModal').classList.remove('open');
}

function closeColModalBackdrop(e) {
  if (e.target === document.getElementById('colModal')) closeColModal();
}

function renderColModal(bankKey) {
  currentModalBank = bankKey;
  const info = BANK_MODAL_INFO[bankKey];

  const tabHtml = Object.keys(BANK_MODAL_INFO).map(k => `
    <button class="bank-tab ${k === bankKey ? 'active' : ''}"
      onclick="renderColModal('${k}')">${esc(BANK_MODAL_INFO[k].name)}</button>
  `).join('');
  document.getElementById('modalBankTabs').innerHTML = tabHtml;

  const stepsHtml = info.steps.map((s, i) =>
    `<span style="display:inline-flex;align-items:center;gap:6px;">
       <span style="background:var(--primary);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${i+1}</span>
       <span>${s}</span>
     </span>${i < info.steps.length-1 ? '<span class="step-arrow"> → </span>' : ''}`
  ).join('');
  document.getElementById('modalExportSteps').innerHTML =
    `<div style="font-size:15px;font-weight:700;margin-bottom:10px;">📤 ${esc(info.name)} 거래내역 내보내기 방법</div>
     <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;line-height:2;">${stepsHtml}</div>`;

  const colRows = info.cols.map((c, i) => `
    <tr style="${i%2===0?'':'background:var(--bg)'}">
      <td style="text-align:center;font-weight:700;color:var(--text-muted);font-size:14px;">${i+1}</td>
      <td style="font-weight:700;font-size:16px;">${esc(c.name)}</td>
      <td><span class="col-role ${ROLE_CLASS[c.role]}">${ROLE_LABEL[c.role]}</span></td>
      <td style="font-family:monospace;font-size:14px;color:var(--primary);">${esc(c.ex)}</td>
      <td style="font-size:14px;color:var(--text-muted);">${esc(c.desc)}</td>
    </tr>
  `).join('');

  document.getElementById('modalColTable').innerHTML = `
    <thead>
      <tr>
        <th style="width:40px;">순서</th>
        <th>컬럼명</th>
        <th style="width:110px;">역할</th>
        <th>예시값</th>
        <th>설명</th>
      </tr>
    </thead>
    <tbody>${colRows}</tbody>
  `;
}

/* =========================================
   은행 거래내역 파싱
========================================= */
let importPending = [];

/**
 * 헤더 배열에서 keys 목록 중 일치하는 첫 번째 컬럼 인덱스를 반환합니다.
 * @param {string[]} headers
 * @param {string[]} keys 탐색할 키워드 목록 (우선순위 순)
 * @returns {number} 못 찾으면 -1
 */
function findCol(headers, keys) {
  for (const k of keys) {
    const idx = headers.findIndex(h => h && String(h).trim().replace(/\s/g,'').includes(k.replace(/\s/g,'')));
    if (idx >= 0) return idx;
  }
  return -1;
}

/**
 * 헤더 키워드로 은행을 자동 판별하여 적합한 스키마를 반환합니다.
 * @param {string[]} headers
 * @returns {typeof BANK_SCHEMAS[keyof typeof BANK_SCHEMAS]}
 */
function autoDetectSchema(headers) {
  const h = headers.map(x => String(x || '').replace(/\s/g,''));
  const joined = h.join('|');
  if (joined.includes('찾으신금액') || joined.includes('맡기신금액')) return BANK_SCHEMAS.nh;
  if (joined.includes('거래일시') && joined.includes('거래내용'))    return BANK_SCHEMAS.ibk;
  if (joined.includes('거래내용') && joined.includes('거래일'))       return BANK_SCHEMAS.woori;
  if (joined.includes('거래일시'))   return BANK_SCHEMAS.kb;
  if (joined.includes('적요'))       return BANK_SCHEMAS.ibk;
  return BANK_SCHEMAS.ibk;
}

/**
 * 콤마 포함 문자열 또는 숫자를 float으로 변환합니다.
 * @param {any} val
 * @returns {number}
 */
function parseNum(val) {
  if (!val && val !== 0) return 0;
  return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
}

/**
 * 다양한 형식의 날짜 값을 'YYYY-MM-DD' 문자열로 정규화합니다.
 * @param {any} val
 * @returns {string}
 */
function parseDate(val) {
  if (!val) return '';
  const s = String(val).replace(/[./]/g, '-').trim();
  if (/^\d{8}$/.test(s)) return s.slice(0,4) + '-' + s.slice(4,6) + '-' + s.slice(6,8);
  const m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + '-' + m[2].padStart(2,'0') + '-' + m[3].padStart(2,'0');
  return s.slice(0,10);
}

/**
 * 원시 행 배열을 파싱하여 날짜·내용·입출금 금액으로 정제된 결과를 반환합니다.
 * @param {any[][]} rawRows xlsx/csv에서 읽은 원시 행 배열
 * @param {any} schema 은행 스키마 (null이면 자동 감지)
 * @returns {{ date: string, desc: string, inAmt: number, outAmt: number, bal: number, include: boolean }[]}
 */
function parseRows(rawRows, schema) {
  let headerIdx = 0;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    const textCells = row.filter(c => c && isNaN(parseFloat(String(c).replace(/,/g,'')))).length;
    if (textCells >= 3) { headerIdx = i; break; }
  }
  const headers = rawRows[headerIdx].map(h => String(h || '').trim());
  const s = schema || autoDetectSchema(headers);

  const dIdx    = findCol(headers, s.dateKeys);
  const descIdx = findCol(headers, s.descKeys);
  const outIdx  = findCol(headers, s.outKeys);
  const inIdx   = findCol(headers, s.inKeys);
  const balIdx  = findCol(headers, s.balKeys);

  const result = [];
  for (let i = headerIdx + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.every(c => !c)) continue;

    const dateRaw = dIdx   >= 0 ? row[dIdx]   : '';
    const desc    = descIdx >= 0 ? String(row[descIdx] || '').trim() : '';
    const outAmt  = outIdx >= 0 ? parseNum(row[outIdx]) : 0;
    const inAmt   = inIdx  >= 0 ? parseNum(row[inIdx])  : 0;
    const bal     = balIdx >= 0 ? parseNum(row[balIdx])  : 0;
    const date    = parseDate(dateRaw);

    if (!date || (!outAmt && !inAmt)) continue;

    result.push({ date, desc, inAmt, outAmt, bal, include: true });
  }
  return result;
}

/* =========================================
   은행 파일 가져오기
========================================= */
/**
 * 은행 거래내역 파일(xlsx/csv)을 읽어 미리보기를 렌더링합니다.
 * @param {Event & { target: HTMLInputElement }} e
 */
async function importBankFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';

  const account = /** @type {HTMLSelectElement} */ (document.getElementById('import-account')).value;
  if (!account) {
    showToast('❌ 계좌 구분을 먼저 선택해주세요', 'error');
    return;
  }

  const bankKey = /** @type {HTMLSelectElement} */ (document.getElementById('import-bank')).value;
  const schema  = bankKey === 'auto' ? null : BANK_SCHEMAS[bankKey];

  try {
    const buf = await file.arrayBuffer();
    let rawRows = [];

    if (file.name.toLowerCase().endsWith('.csv')) {
      const text = new TextDecoder('euc-kr').decode(buf);
      rawRows = text.split('\n').map(line => line.split(',').map(c => c.replace(/^"|"$/g,'').trim()));
    } else {
      const wb = XLSX.read(buf, { type: 'array', cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    }

    const parsed = parseRows(rawRows, schema);
    if (!parsed.length) {
      showToast('❌ 인식 가능한 거래내역을 찾지 못했습니다', 'error');
      return;
    }

    importPending = parsed;
    renderImportPreview();

  } catch(err) {
    console.error(err);
    showToast('❌ 파일을 읽을 수 없습니다: ' + err.message, 'error');
  }
}

function renderImportPreview() {
  const account = /** @type {HTMLSelectElement} */ (document.getElementById('import-account')).value;
  const accLabel = ACCOUNTS.find(a => a.key === account)?.label || account;
  const inCount  = importPending.filter(r => r.inAmt  > 0).length;
  const outCount = importPending.filter(r => r.outAmt > 0).length;

  const existingKeys = new Set(
    transactions.map(t => `${t.date}|${t.desc}|${t.amount}|${t.type}`)
  );
  const isDup = r => {
    if (r.inAmt  > 0 && existingKeys.has(`${r.date}|${r.desc}|${r.inAmt}|입금`))  return true;
    if (r.outAmt > 0 && existingKeys.has(`${r.date}|${r.desc}|${r.outAmt}|출금`)) return true;
    return false;
  };
  const dupCount = importPending.filter(isDup).length;

  document.getElementById('import-summary').innerHTML =
    `총 <strong>${importPending.length}건</strong> 인식 ―
     입금 <strong style="color:var(--primary)">${inCount}건</strong> /
     출금 <strong style="color:var(--accent)">${outCount}건</strong>
     ${dupCount ? `/ 중복의심 <strong style="color:#b8860b">${dupCount}건</strong>` : ''}<br>
     계좌: <strong>${esc(accLabel)}</strong>에 등록됩니다. 제외할 항목은 체크를 해제하세요.
     ${dupCount ? '<br><span style="color:#b8860b;font-size:13px;">⚠ 노란색 행은 이미 등록된 내역일 수 있습니다. 체크 해제 후 가져오기를 권장합니다.</span>' : ''}`;

  const tbody = document.getElementById('import-tbody');
  tbody.innerHTML = importPending.map((r, i) => {
    const dup = isDup(r);
    let rowStyle = '';
    if (!r.include) rowStyle = 'opacity:.4;';
    else if (dup)   rowStyle = 'background:#fffbe6;';
    return `
    <tr style="${rowStyle}">
      <td>${fmtDate(r.date)}</td>
      <td class="td-left">${esc(r.desc)}${dup ? ' <span style="background:#ffd700;color:#5a4000;font-size:11px;padding:1px 6px;border-radius:3px;font-weight:700;margin-left:4px;">중복</span>' : ''}</td>
      <td class="amount-in">${r.inAmt  ? fmtKrw(r.inAmt)  : ''}</td>
      <td class="amount-out">${r.outAmt ? fmtKrw(r.outAmt) : ''}</td>
      <td style="color:var(--text-muted);font-size:13px;">${r.bal ? fmtKrw(r.bal) : ''}</td>
      <td><input type="checkbox" ${r.include ? 'checked' : ''}
          onchange="importPending[${i}].include = this.checked; renderImportPreview()"
          style="width:20px;height:20px;cursor:pointer;accent-color:var(--primary);"></td>
    </tr>`;
  }).join('');

  document.getElementById('import-preview').style.display = 'block';
}

function confirmImport() {
  const account = /** @type {HTMLSelectElement} */ (document.getElementById('import-account')).value;
  if (!account) { showToast('❌ 계좌 구분을 선택해주세요', 'error'); return; }
  const selected = importPending.filter(r => r.include);
  if (!selected.length) { showToast('선택된 항목이 없습니다', 'error'); return; }

  let added = 0;
  selected.forEach(r => {
    const addRow = (type, amount) => {
      transactions.push({ id: crypto.randomUUID(), date: r.date, account, type, amount, desc: r.desc, note: '은행파일' });
      added++;
    };
    if (r.inAmt  > 0) addRow('입금', r.inAmt);
    if (r.outAmt > 0) addRow('출금', r.outAmt);
  });

  saveData();
  renderAll();
  cancelImport();
  showToast(`✅ ${added}건 가져오기 완료`, 'success');
}

function cancelImport() {
  importPending = [];
  document.getElementById('import-preview').style.display = 'none';
}
