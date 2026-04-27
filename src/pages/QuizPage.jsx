import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SCALES, OPTIONS, calculateScaleResults } from '../data/scales';
import { saveScaleResult, unlockMonth } from '../store/store';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scale = SCALES.find(s => s.id === id);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [summaryResults, setSummaryResults] = useState(null);

  useEffect(() => {
    if (!scale) navigate('/scales');
  }, [scale, navigate]);

  // 所有 hooks 定义必须在任何条件返回之前
  const questions = scale?.questions || [];
  const total = questions.length;
  const progress = total > 0 ? ((currentQ + 1) / total) * 100 : 0;
  const currentQuestion = questions[currentQ];

  const handleSelect = (option) => {
    setSelected(option);
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
    setShowFeedback(true);
  };

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    if (currentQ < total - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
    } else {
      // 最后一题：手动合并当前选中项，避免 state 异步问题
      const finalAnswers = { ...answers, [currentQ]: selected };
      const allAnswers = questions.map((q, i) => finalAnswers[i]);
      const results = calculateScaleResults(scale, allAnswers);
      saveScaleResult(scale.id, results);
      const month = new Date().getMonth() + 1;
      unlockMonth(month);
      setSummaryResults(results);
      setFinished(true);
    }
  }, [currentQ, total, answers, selected, questions, scale]);

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
      const prevAnswer = answers[currentQ - 1];
      setSelected(prevAnswer || null);
      setShowFeedback(!!prevAnswer);
    }
  }, [currentQ, answers]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight' && showFeedback) {
      handleNext();
    }
  }, [handlePrev, handleNext, showFeedback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // early return 在所有 hooks 之后
  if (!scale) return null;

  if (finished) {
    // 从结果中提取关键数据
    const dimRanked = scale.dimensions
      .map(d => ({ ...d, value: summaryResults?.[d.key] ?? 0 }))
      .sort((a, b) => b.value - a.value);
    const topDim = dimRanked[0];
    const lowDim = dimRanked[dimRanked.length - 1];
    const avgScore = Math.round(dimRanked.reduce((s, d) => s + d.value, 0) / dimRanked.length);

    // 评语
    const getSummary = () => {
      if (avgScore >= 75) return '你的整体身心状态较为稳定，继续保持对自己这份温柔的关注。';
      if (avgScore >= 50) return '你的身心状态有一些波动，这是正常的。看见它，就是改变的开始。';
      return '你最近可能承受了不少，辛苦了。允许自己慢下来，好好照顾自己。';
    };

    return (
      <div className="page-container">
        {/* 完成头部 */}
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>{scale.icon}</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>测评完成</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 4 }}>{scale.title}</p>
          <p style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
            {new Date().toLocaleDateString('zh-CN')} 完成
          </p>
        </div>

        {/* 核心数据卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 4 }}>综合得分</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>{avgScore}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>满分 100</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 4 }}>最显著</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff6b9d' }}>{topDim?.label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{topDim?.value}%</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 4 }}>最稳定</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#51cf66' }}>{lowDim?.label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{lowDim?.value}%</div>
          </div>
        </div>

        {/* 一句话总结 */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.06), rgba(255,107,157,0.06))' }}>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text)', margin: 0 }}>
            {getSummary()}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="result-footer-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>
            🏠 返回首页
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/result/${scale.id}`)} style={{ flex: 1 }}>
            📊 详细报告
          </button>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/garden')}
          style={{ width: '100%', marginTop: 8 }}
        >
          🌸 去花园看看
        </button>
      </div>
    );
  }

  // 当前量表使用的选项（支持4级和5级）
  const scaleOptions = scale.options || OPTIONS;

  // 当前题反馈
  const feedback = selected && currentQuestion?.feedback ? currentQuestion.feedback[selected.key] : null;

  return (
    <div className="page-container">
      {/* 顶部进度 */}
      <div className="quiz-header">
        <button className="btn btn-ghost" onClick={() => navigate('/scales')}>← 返回</button>
        <div className="quiz-progress-info">
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{currentQ + 1}</span>
          <span style={{ color: 'var(--text-light)' }}> / {total}</span>
        </div>
        <span className="scale-name-tag">{scale.shortTitle}</span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* 维度标签 */}
      {currentQuestion && (
        <div className="quiz-dim-tag" style={{ marginBottom: 12 }}>
          {scale.dimensions.find(d => d.key === currentQuestion.dim)?.label}
        </div>
      )}

      {/* 题目卡片 */}
      <div className="quiz-card card">
        <div className="quiz-q-number">第 {currentQ + 1} 题</div>
        <p className="quiz-question">{currentQuestion.text}</p>

        <div className="quiz-options">
          {scaleOptions.map((opt, idx) => {
            const isSelected = selected && selected.key === opt.key;
            const isFeedbackVisible = showFeedback && isSelected;
            const fb = isFeedbackVisible ? currentQuestion.feedback[opt.key] : null;
            // 新量表反馈是字符串，旧量表反馈是数组[接纳, 建议]
            const isStringFeedback = typeof fb === 'string';
            return (
              <div key={opt.key}>
                <button
                  className={`quiz-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{opt.text}</span>
                </button>
                {/* 反馈紧跟选中选项 */}
                {isFeedbackVisible && fb && (
                  <div className="feedback-inline">
                    {isStringFeedback ? (
                      <div className="feedback-section feedback-full">
                        <div className="feedback-label">🌱 温暖回应</div>
                        <p className="feedback-text">{fb}</p>
                      </div>
                    ) : (
                      <>
                        <div className="feedback-section feedback-accept">
                          <div className="feedback-label">🤍 接纳当下</div>
                          <p className="feedback-text">{fb[0]}</p>
                        </div>
                        <div className="feedback-section feedback-suggest">
                          <div className="feedback-label">🌱 温和建议</div>
                          <p className="feedback-text">{fb[1]}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 导航按钮 — 左右分列 */}
      <div className="quiz-nav-fixed">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={handlePrev}
          disabled={currentQ === 0}
          aria-label="上一题"
        >
          ‹
        </button>
        {showFeedback && (
          <button
            className="nav-arrow nav-arrow-right"
            onClick={handleNext}
            aria-label={currentQ === total - 1 ? '完成测评' : '下一题'}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
