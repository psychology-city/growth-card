const fs = require('fs');
const src = fs.readFileSync('C:\\Users\\25890\\Desktop\\项目：个人成长名片\\growth-card\\src\\data\\scales.js', 'utf-8');

// Replace 'export' statements
const code = src
  .replace(/^export const/g, 'const')
  .replace(/^export function/g, 'function');

eval(code);

// Test quick-test
const quickTest = SCALES.find(s => s.id === 'quick-test');
console.log('=== Quick Test Scale ===');
console.log('Questions:', quickTest.questions.length);
console.log('Dimensions:', quickTest.dimensions.length);

// Simulate all-A answers
const answers = quickTest.questions.map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
const results = calculateScaleResults(quickTest, answers);
console.log('Results:', JSON.stringify(results, null, 2));
console.log('Has _interpretations:', !!results._interpretations);

// Test bodymind
const bodymind = SCALES.find(s => s.id === 'bodymind');
console.log('\n=== Bodymind Scale ===');
console.log('Questions:', bodymind.questions.length);
console.log('Dimensions:', bodymind.dimensions.length);

const bodymindAnswers = bodymind.questions.map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
const bodymindResults = calculateScaleResults(bodymind, bodymindAnswers);
console.log('First 3 dims:', Object.entries(bodymindResults).slice(0, 3));
console.log('Has _interpretations:', !!bodymindResults._interpretations);

// Test with missing last answer (simulating the old bug)
const brokenAnswers = bodymind.questions.slice(0, -1).map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
brokenAnswers.push(undefined);
console.log('\n=== Broken (last answer missing) ===');
const brokenResults = calculateScaleResults(bodymind, brokenAnswers);
console.log('Has NaN:', Object.values(brokenResults).some(v => Number.isNaN(v)));
console.log('Last dim value:', brokenResults[bodymind.dimensions[bodymind.dimensions.length - 1].key]);
