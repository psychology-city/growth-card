/**
 * 数据持久化管理（基于 localStorage）
 */

const STORAGE_KEY = 'growth-card-data';

const defaultData = {
  userName: '',
  completedScales: {},   // { scaleId: { date, results } }
  unlockedMonths: [],     // [1, 2, 3...] 已解锁的月份
  gardenFlowers: {},      // { month: { name, emoji, unlockedAt } }
  createdAt: new Date().toISOString(),
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return { ...defaultData };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

// ===== 用户名 =====
export function getUserName() {
  return loadData().userName;
}

export function setUserName(name) {
  const data = loadData();
  data.userName = name;
  saveData(data);
}

// ===== 量表完成记录 =====
export function getCompletedScales() {
  return loadData().completedScales;
}

export function saveScaleResult(scaleId, results) {
  const data = loadData();
  data.completedScales[scaleId] = {
    date: new Date().toISOString(),
    results,
  };
  saveData(data);
}

// ===== 花园解锁记录 =====
export function getUnlockedMonths() {
  return loadData().unlockedMonths;
}

export function unlockMonth(month) {
  const data = loadData();
  if (!data.unlockedMonths.includes(month)) {
    data.unlockedMonths.push(month);
    data.gardenFlowers[month] = {
      name: '',
      emoji: '',
      unlockedAt: new Date().toISOString(),
    };
    saveData(data);
  }
  return true;
}

export function getGardenFlowers() {
  return loadData().gardenFlowers;
}

// ===== 合并各量表维度 → 维度总图数据 =====
export function getOverallProfile() {
  const completed = getCompletedScales();
  const profile = {};

  // 新量表：身心状态觉察量表 (bodymind)
  const bodymind = completed.bodymind;
  if (bodymind && bodymind.results) {
    const r = bodymind.results;
    // 从10个维度中选取6个最具代表性的显示在首页总图
    const dimMap = {
      body: '身心体感',
      rumination: '内耗执念',
      social: '人际感知',
      depletion: '情绪耗竭',
      anxiety: '思绪不安',
      resistance: '情绪抵触',
      avoidance: '场景回避',
      vigilance: '过度防备',
      dissociate: '思绪游离',
      rhythm: '节律稳定',
    };
    Object.entries(dimMap).forEach(([key, label]) => {
      if (r[key] !== undefined) {
        profile[label] = r[key];
      }
    });
  }

  // 新量表：个人成长综合量表 (growth88)
  const growth88 = completed.growth88;
  if (growth88 && growth88.results) {
    const r = growth88.results;
    const dimMap = {
      awareness: '自我觉察',
      emotion_id: '情绪感知',
      emotion_acc: '内在感知',
      emotion_reg: '情绪复原',
      self_accept: '内在和解',
      boundary: '主权守护',
      autonomy: '行动能动',
      responsibility: '成长责任',
      rational: '逻辑判断',
      execution: '成事行动',
      learning: '自我进化',
      resilience: '抗压复原',
      anti_rumination: '内心清净',
      social_emp: '社交共情',
      self_disc: '自律节制',
      adaptability: '落地适应',
      gratitude: '积极心力',
      independence: '核心定力',
    };
    Object.entries(dimMap).forEach(([key, label]) => {
      if (r[key] !== undefined) {
        profile[label] = r[key];
      }
    });
  }

  return profile;
}

// ===== 删除单个量表记录 =====
export function deleteScaleResult(scaleId) {
  const data = loadData();
  delete data.completedScales[scaleId];
  saveData(data);
}

// ===== 重置 =====
export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== 清空花园数据 =====
export function clearGardenData() {
  const data = loadData();
  data.gardenFlowers = {};
  data.unlockedMonths = [];
  saveData(data);
}
