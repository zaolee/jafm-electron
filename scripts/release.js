const { execSync } = require('child_process');
const fs = require('fs');

// package.json에서 현재 버전 읽기
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const current = pkg.version.split('.').map(Number);

// 패치 버전 자동으로 +1
current[2] += 1;
const newVersion = current.join('.');

// package.json 버전 업데이트
pkg.version = newVersion;
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2), 'utf-8');

console.log(`\n🚀 배포 시작: v${newVersion}\n`);

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "chore: v${newVersion} 배포"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  execSync('git push --tags', { stdio: 'inherit' });
  console.log(`\n✅ v${newVersion} 배포 완료!\n`);
} catch (e) {
  console.error('\n❌ 배포 실패:', e.message);
}
