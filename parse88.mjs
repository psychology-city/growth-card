import { readFileSync, writeFileSync } from 'fs';

const md = readFileSync(String.raw`C:\Users\25890\Desktop\项目：个人成长名片\个人成长量表\5 likert 版本.md`, 'utf-8');

const DIMS_88 = [
  { key: 'awareness',      label: '自我觉察与认知',  shortLabel: '内观力',   color: '#6c63ff', qRange: [1, 6] },
  { key: 'emotion_id',     label: '情绪识别与表达',  shortLabel: '情绪感知',  color: '#ff6b9d', qRange: [7, 12] },
  { key: 'emotion_acc',    label: '情绪觉察与接纳',  shortLabel: '内在感知',  color: '#e84393', qRange: [13, 18] },
  { key: 'emotion_reg',    label: '情绪调节与安抚',  shortLabel: '情绪复原',  color: '#fd79a8', qRange: [19, 24] },
  { key: 'self_accept',    label: '自我接纳与价值',  shortLabel: '内在和解',  color: '#00b894', qRange: [25, 30] },
  { key: 'boundary',       label: '人际边界与保护',  shortLabel: '主权守护',  color: '#00cec9', qRange: [31, 36] },
  { key: 'autonomy',       label: '自主掌控与主导',  shortLabel: '行动能动',  color: '#0984e3', qRange: [37, 42] },
  { key: 'responsibility', label: '自我负责与担当',  shortLabel: '成长责任',  color: '#6c5ce7', qRange: [43, 48] },
  { key: 'rational',       label: '理性认知与思维', shortLabel: '逻辑判断',  color: '#a29bfe', qRange: [49, 52] },
  { key: 'execution',      label: '目标管理与执行', shortLabel: '成事行动',  color: '#fdcb6e', qRange: [53, 56] },
  { key: 'learning',       label: '学习成长与迭代', shortLabel: '自我进化',  color: '#f39c12', qRange: [57, 60] },
  { key: 'resilience',     label: '压力耐受与韧性', shortLabel: '抗压复原',  color: '#e17055', qRange: [61, 64] },
  { key: 'anti_rumination',label: '情绪内耗与清净', shortLabel: '内心清净',  color: '#d63031', qRange: [65, 68] },
  { key: 'social_emp',     label: '情绪表达与协作', shortLabel: '社交共情',  color: '#e84393', qRange: [69, 72] },
  { key: 'self_disc',      label: '欲望管理与自律', shortLabel: '自律节制',  color: '#2d3436', qRange: [73, 76] },
  { key: 'adaptability',   label: '现实接纳与弹性', shortLabel: '落地适应',  color: '#636e72', qRange: [77, 80] },
  { key: 'gratitude',      label: '感恩能力与正向', shortLabel: '积极心力',  color: '#55efc4', qRange: [81, 84] },
  { key: 'independence',   label: '独立人格与安稳', shortLabel: '核心定力',  color: '#74b9ff', qRange: [85, 88] },
];

function getDimByQNum(num) {
  for (const dim of DIMS_88) {
    if (num >= dim.qRange[0] && num <= dim.qRange[1]) return dim.key;
  }
  return 'awareness';
}

function cleanOptText(t) {
  // 移除（围绕 "..."）部分
  t = t.replace(/\s*（围绕\s*["""][^）]+["""]）\s*/g, '');
  // 移除末尾句号
  if (t.endsWith('。')) t = t.slice(0, -1);
  return t.trim();
}

const questions = [];
const lines = md.split('\n');

let currentQNum = 0;
let options = {};
let feedbacks = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith('#')) continue;

  // 匹配题目标题
  const qMatch = line.match(/^\*\*第\s*(\d+)\s*题\*\*/);
  if (qMatch) {
    // 保存上一题
    if (currentQNum > 0 && Object.keys(options).length >= 4) {
      questions.push({ qNum: currentQNum, options: { ...options }, feedback: { ...feedbacks } });
    }
    currentQNum = parseInt(qMatch[1]);
    options = {};
    feedbacks = {};

    // 检查题目标题后是否紧跟选项（单行格式）
    const afterTitle = line.replace(/^\*\*第\s*\d+\s*题\*\*[：:]?\s*/, '').trim();
    if (afterTitle && afterTitle.match(/^[A-E]/)) {
      // 单行格式：**第 X 题**：A...｜B...｜C...｜D...｜E...
      const parts = afterTitle.split('｜').map(s => s.trim()).filter(Boolean);
      for (const part of parts) {
        const m = part.match(/^([A-E])\s+(.+)/);
        if (m) {
          options[m[1]] = cleanOptText(m[2]);
        }
      }
    }
    continue;
  }

  // 匹配反馈行
  const fbMatch = line.match(/^选\s*([A-E])\s*夸奖[：:]\s*(.+)/);
  if (fbMatch) {
    let t = fbMatch[2];
    if (t.endsWith('。')) t = t.slice(0, -1);
    feedbacks[fbMatch[1]] = t;
    continue;
  }

  // 匹配选项行（含｜分隔符的单行格式）
  if (line.includes('｜')) {
    const parts = line.split('｜').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const m = part.match(/^([A-E])\s+(.+)/);
      if (m) {
        options[m[1]] = cleanOptText(m[2]);
      }
    }
    continue;
  }

  // 匹配单独一行选项
  const optMatch = line.match(/^([A-E])\s+(.+)/);
  if (optMatch) {
    options[optMatch[1]] = cleanOptText(optMatch[2]);
    continue;
  }
}

// 保存最后一题
if (currentQNum > 0 && Object.keys(options).length >= 4) {
  questions.push({ qNum: currentQNum, options: { ...options }, feedback: { ...feedbacks } });
}

// 转换格式
const formattedQuestions = questions.map(q => {
  const dim = getDimByQNum(q.qNum);
  const qText = q.options.A || `第${q.qNum}题`;
  return {
    text: qText,
    dim,
    feedback: {
      A: q.feedback.A || '',
      B: q.feedback.B || '',
      C: q.feedback.C || '',
      D: q.feedback.D || '',
      E: q.feedback.E || '',
    }
  };
});

console.log(`Parsed ${formattedQuestions.length} questions`);
const dimCounts = {};
for (const q of formattedQuestions) {
  dimCounts[q.dim] = (dimCounts[q.dim] || 0) + 1;
}
console.log('维度分布:', JSON.stringify(dimCounts));

// 生成JS
const jsContent = `/**
 * 个人成长综合量表（88 题完整版）
 * 18 个核心维度 · 5 级 Likert 评分
 * A=1 B=2 C=3 D=4 E=5（分数越高越成熟）
 */

export const OPTIONS_5 = [
  { key: 'A', text: '完全不符合', score: 1 },
  { key: 'B', text: '比较不符合', score: 2 },
  { key: 'C', text: '一般', score: 3 },
  { key: 'D', text: '比较符合', score: 4 },
  { key: 'E', text: '完全符合', score: 5 },
];

export const DIMS_88 = ${JSON.stringify(DIMS_88.map(d => ({ key: d.key, label: d.label, shortLabel: d.shortLabel, color: d.color })), null, 2)};

export const INTERPRETATIONS_88 = {
  awareness: '自我觉察是你读懂自己的能力。无论目前处于什么阶段，觉察永远是成长的第一步——看见模式，才能选择改变。',
  emotion_id: '情绪识别与表达是你与世界连接的桥梁。能读懂自己的情绪、理解他人的感受，是人际关系中最温柔的力量。',
  emotion_acc: '接纳情绪不是妥协，而是一种深刻的内在智慧。允许情绪存在、允许自己感受，反而能更快穿越风暴。',
  emotion_reg: '情绪调节不是压抑，而是学会与情绪和平共处。每一次主动调节，都是在为自己的人生争取主动权。',
  self_accept: '自我接纳是内在和解的起点。接纳不完美的自己，不代表放弃成长，而是带着温柔与清醒持续精进。',
  boundary: '边界感是健康关系的基石。温柔而坚定地守住自己的立场，既是对自己的尊重，也是对他人的真诚。',
  autonomy: '自主性是人生的方向盘。忠于内心、主动选择，你的人生才能真正由自己定义。',
  responsibility: '责任意识是成熟的标志。直面问题、承担后果，不是负担，而是赢得信任与自由的通行证。',
  rational: '理性思维是穿越迷雾的罗盘。独立思考、逻辑判断，让你不被偏见与情绪裹挟，做出更清醒的选择。',
  execution: '执行力是梦想落地的关键。目标清晰、行动果断、坚持到底，你的人生会因此大不同。',
  learning: '学习力是终身成长的核心。保持好奇、持续输入、高效转化，你的认知边界会不断扩展。',
  resilience: '抗压韧性是穿越逆境的底气。挫折是人生的必修课，快速修复、持续前行，是成熟者的标配。',
  anti_rumination: '反内耗是守护精力的核心能力。减少无效思虑、快速翻篇，你才能把有限的能量用在真正重要的事上。',
  social_emp: '社交共情力是关系的润滑剂。真诚表达、换位思考、高效协作，让人际关系成为滋养而非消耗。',
  self_disc: '自律节制是长期主义的基石。延迟满足、管理欲望、保持节律，当下的克制会换取更丰盈的未来。',
  adaptability: '现实适应力是生存的智慧。接纳现实、灵活调整、顺势而为，不困执念、不惧变化，才能在不确定中稳步前行。',
  gratitude: '感恩与正向视角是心灵的阳光。看见美好、珍惜所得、自我鼓励，你的内在会越来越丰盈坚韧。',
  independence: '独立人格是人生的定海神针。精神自足、内心安稳、节奏自主，外界万变而本心不乱，是顶级的生命状态。',
};

export const QUESTIONS_88 = ${JSON.stringify(formattedQuestions, null, 2)};

export const SCALE_88 = {
  id: 'growth88',
  title: '个人成长综合量表',
  shortTitle: '成长88题',
  description: '88 题 · 18 大成长维度，全面洞察你的心理能量',
  icon: '🌱',
  color: '#00b894',
  bgGradient: 'linear-gradient(135deg, rgba(0,184,148,0.08), rgba(108,99,255,0.08))',
  estimatedTime: '约 15 分钟',
  questionCount: 88,
  intro: '这份量表涵盖自我觉察、情绪管理、人际边界、行动力、抗压韧性等18个核心维度，帮你全面看见自己的心理能量分布。没有好坏对错，每一分都是你当下的真实状态。',
  dimensions: DIMS_88,
  options: OPTIONS_5,
  questions: QUESTIONS_88,
  _interpretations: INTERPRETATIONS_88,
  maxScorePerQ: 5,
};
`;

writeFileSync(String.raw`C:\Users\25890\Desktop\项目：个人成长名片\growth-card\src\data\growth88.js`, jsContent, 'utf-8');
console.log('Written growth88.js');
