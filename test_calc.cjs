const fs = require('fs');
const vm = require('vm');
let src = fs.readFileSync('C:\\Users\\25890\\Desktop\\项目：个人成长名片\\growth-card\\src\\data\\scales.js', 'utf-8');

// Remove all 'export ' prefixes
src = src.replace(/^export\s+/gm, '');

// Replace const/let with var for top-level
src = src.replace(/^(const|let)\s/gm, 'var ');

const context = { console, Array, Object, Math, JSON };
vm.createContext(context);
vm.runInContext(src, context);

const SCALES = context.SCALES;
const calculateScaleResults = context.calculateScaleResults;

// Test quick-test
const quickTest = SCALES.find(s => s.id === 'quick-test');
console.log('=== Quick Test ===');
console.log('Q:', quickTest.questions.length, 'D:', quickTest.dimensions.length);

const answers = quickTest.questions.map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
const results = calculateScaleResults(quickTest, answers);
console.log('Results:', JSON.stringify(results, null, 2));

// Test bodymind
const bodymind = SCALES.find(s => s.id === 'bodymind');
console.log('\n=== Bodymind ===');
console.log('Q:', bodymind.questions.length, 'D:', bodymind.dimensions.length);
const bmAnswers = bodymind.questions.map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
const bmResults = calculateScaleResults(bodymind, bmAnswers);
console.log('Sample:', bodymind.dimensions.slice(0,3).map(d => d.key + ':' + bmResults[d.key]));

// Simulate old bug: last answer undefined
const brokenAnswers = bodymind.questions.slice(0, -1).map(() => ({ key: 'A', text: '几乎没有', score: 4 }));
brokenAnswers.push(undefined);
const brokenResults = calculateScaleResults(bodymind, brokenAnswers);
console.log('\n=== Old Bug Sim (bodymind, last missing) ===');
console.log('Values:', bodymind.dimensions.map(d => d.key + '=' + brokenResults[d.key]));
console.log('Any NaN:', Object.values(brokenResults).some(v => typeof v === 'number' && isNaN(v)));
console.log('Has _interpretations:', !!brokenResults._interpretations);

// Quick test: last answer missing
const qtBroken = quickTest.questions.map((_, i) => i < 4 ? { key: 'A', text: '几乎没有', score: 4 } : undefined);
const qtBrokenResults = calculateScaleResults(quickTest, qtBroken);
console.log('\n=== Quick Test Last Missing ===');
console.log('Results:', JSON.stringify(qtBrokenResults, null, 2));
