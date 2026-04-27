const md = require('fs').readFileSync(
  String.raw`C:\Users\25890\Desktop\项目：个人成长名片\个人成长量表\5 likert 版本.md`, 'utf-8');
const lines = md.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('第 59 题') || lines[i].includes('第 60 题')) {
    console.log(`--- Line ${i} ---`);
    for (let j = i; j < Math.min(i + 30, lines.length); j++) {
      console.log(`  ${j}: ${lines[j]}`);
    }
    break;
  }
}
