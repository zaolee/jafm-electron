/**
 * scripts/download-xlsx.js
 * 
 * xlsx(SheetJS) 라이브러리를 CDN에서 받아 assets/ 폴더에 저장합니다.
 * 최초 설치 시 또는 라이브러리 업데이트 시 실행합니다.
 * 
 * 실행: node scripts/download-xlsx.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const URL      = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const DEST     = path.join(__dirname, '..', 'assets', 'xlsx.full.min.js');
const ASSETS   = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS, { recursive: true });

console.log('xlsx 라이브러리 다운로드 중...');
console.log('URL:', URL);

const file = fs.createWriteStream(DEST);
https.get(URL, (res) => {
  if (res.statusCode !== 200) {
    console.error('❌ 다운로드 실패:', res.statusCode);
    process.exit(1);
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    const size = (fs.statSync(DEST).size / 1024).toFixed(1);
    console.log(`✅ 완료: assets/xlsx.full.min.js (${size} KB)`);
  });
}).on('error', (err) => {
  fs.unlink(DEST, () => {});
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
