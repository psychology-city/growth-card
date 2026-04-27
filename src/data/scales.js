/**
 * 心理量表数据
 * 包含题目、维度计分规则、结果解读
 */

// 导入88题量表
import { SCALE_88, OPTIONS_5, INTERPRETATIONS_88 } from './scales/growth88.js';

// 导入90题量表
import { SCALE_90, OPTIONS_4, INTERPRETATIONS_90 } from './scales/bodymind90.js';

// 重新导出选项（兼容 QuizPage）
export const OPTIONS = OPTIONS_5;

// 重新导出解读（兼容 ResultPage）
// 合并两个量表的解读
export const DIMENSION_INTERPRETATIONS = {
  ...INTERPRETATIONS_88,
  ...INTERPRETATIONS_90,
};

// ===== 量表列表 =====
export const SCALES = [
  SCALE_88,
  SCALE_90,
];

// ===== 计分逻辑 =====
export function calculateScaleResults(scale, answers) {
  const dimTotals = {};
  const dimCounts = {};

  scale.questions.forEach((q, idx) => {
    const answer = answers[idx];
    if (answer) {
      const dim = q.dim;
      dimTotals[dim] = (dimTotals[dim] || 0) + answer.score;
      dimCounts[dim] = (dimCounts[dim] || 0) + 1;
    }
  });

  const result = {};
  scale.dimensions.forEach(d => {
    const avg = dimCounts[d.key] > 0 ? dimTotals[d.key] / dimCounts[d.key] : 0;
    const maxScore = scale.maxScorePerQ || 5;
    result[d.key] = Math.round((avg / maxScore) * 100);
  });
  return result;
}
