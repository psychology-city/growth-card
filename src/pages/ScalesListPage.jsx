import { Link } from 'react-router-dom';
import { SCALES } from '../data/scales';
import { getCompletedScales } from '../store/store';

export default function ScalesListPage() {
  const completed = getCompletedScales();

  return (
    <div className="page-container">
      <h1 className="page-title">📋 个人成长测试</h1>
      <p className="page-subtitle">温柔看见自己，每一份觉察都是成长的开始</p>

      <div className="scales-list">
        {SCALES.map(scale => {
          const isDone = !!completed[scale.id];
          return (
            <div key={scale.id} className="scale-card" style={{ background: scale.bgGradient }}>
              <div className="scale-card-header">
                <div className="scale-icon" style={{ background: scale.color }}>
                  {scale.icon}
                </div>
                <div className="scale-meta">
                  <span className="scale-title">{scale.title}</span>
                  <span className="scale-time">⏱ {scale.estimatedTime} · {scale.questionCount} 题</span>
                </div>
                {isDone && <span className="done-badge">✓ 已完成</span>}
              </div>
              <p className="scale-desc">{scale.description}</p>

              {/* 测评导语 */}
              <div className="scale-intro">
                <p className="intro-text">{scale.intro}</p>
              </div>

              <div className="scale-dims">
                {scale.dimensions.slice(0, 5).map(d => (
                  <span key={d.key} className="tag tag-purple" style={{ background: `${d.color}22`, color: d.color, borderColor: `${d.color}44` }}>{d.label}</span>
                ))}
                <span className="tag tag-purple">+{scale.dimensions.length - 5}</span>
              </div>
              <div className="scale-footer">
                <Link to={`/scale/${scale.id}`} className="btn btn-primary" style={{ flex: 1 }}>
                  {isDone ? '🔄 重新测试' : '▶ 开始测试'}
                </Link>
                {isDone && (
                  <Link to={`/result/${scale.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    📊 查看报告
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
