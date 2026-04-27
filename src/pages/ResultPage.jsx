import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { SCALES, DIMENSION_INTERPRETATIONS } from '../data/scales';
import { getCompletedScales, getUserName, deleteScaleResult } from '../store/store';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scale = SCALES.find(s => s.id === id);
  const userName = getUserName() || '你';

  const [scaleData, setScaleData] = useState(null);
  const [recordDate, setRecordDate] = useState('');

  useEffect(() => {
    if (!scale) { navigate('/scales'); return; }
    const completed = getCompletedScales();
    const record = completed[id];
    if (!record) { navigate(`/scale/${id}`); return; }
    setScaleData(record.results);
    setRecordDate(record.date);
  }, [id, scale, navigate]);

  if (!scale || !scaleData) return null;

  const results = scaleData;
  const interpretations = results._interpretations || DIMENSION_INTERPRETATIONS;
  const radarLabels = scale.dimensions.map(d => d.label);
  const radarValues = scale.dimensions.map(d => results[d.key]);

  // 找出得分最高和最低的维度
  const dimRanked = scale.dimensions
    .map(d => ({ ...d, value: results[d.key] }))
    .sort((a, b) => b.value - a.value);
  const topDim = dimRanked[0];
  const lowDim = dimRanked[dimRanked.length - 1];

  // 删除报告
  const handleDelete = () => {
    if (window.confirm('确定要删除这份报告吗？删除后需要重新测试。')) {
      deleteScaleResult(id);
      navigate('/scales');
    }
  };

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        ← 返回首页
      </button>

      {/* 头部概览 */}
      <div className="card result-preview">
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{scale.icon}</div>
        <h2 className="result-title">{scale.title}</h2>
        <p className="result-sub">完成于 {new Date(recordDate).toLocaleDateString('zh-CN')}</p>
        <p className="result-sub" style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7 }}>
          {scale.intro}
        </p>
      </div>

      {/* 雷达图 */}
      <div className="card">
        <div className="card-title">📊 维度总览</div>
        <div className="radar-wrapper">
          <Radar
            data={{
              labels: radarLabels,
              datasets: [{
                label: '你的得分',
                data: radarValues,
                backgroundColor: `${scale.color}33`,
                borderColor: scale.color,
                borderWidth: 2,
                pointBackgroundColor: scale.color,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                r: {
                  min: 0, max: 100,
                  ticks: { stepSize: 25, backdropColor: 'transparent', font: { size: 10 } },
                  grid: { color: 'rgba(108, 99, 255, 0.1)' },
                  pointLabels: { font: { size: 11, weight: '600' }, color: '#4a5568' },
                  angleLines: { color: 'rgba(108, 99, 255, 0.1)' },
                },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
        <p className="radar-hint">数值越高代表该维度感受越明显</p>
      </div>

      {/* 快速总结 */}
      <div className="card">
        <div className="card-title">🪞 快速看见</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,107,157,0.08)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 4 }}>最显著感受</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ff6b9d' }}>{topDim.label}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 2 }}>{topDim.value}%</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(81,207,102,0.08)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 4 }}>最稳定状态</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#51cf66' }}>{lowDim.label}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 2 }}>{lowDim.value}%</div>
          </div>
        </div>
      </div>

      {/* 维度条 + 解读 */}
      <div className="card">
        <div className="card-title">🎯 各维度详解</div>
        {scale.dimensions.map((dim) => {
          const val = results[dim.key];
          const interpretation = interpretations[dim.key] || '';
          return (
            <div key={dim.key} className="dim-bar-item">
              <div className="dim-bar-label">
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{dim.label}</span>
              </div>
              <div className="dim-bar-track">
                <div className="dim-bar-fill" style={{ width: `${val}%`, background: scale.color }}></div>
              </div>
              <div className="dim-bar-score">
                <span style={{ color: scale.color, fontWeight: 700 }}>{val}</span>
                <span style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginLeft: 4 }}>
                  {val >= 75 ? '较显著' : val >= 50 ? '中等' : '较稳定'}
                </span>
              </div>
              {interpretation && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4, lineHeight: 1.7 }}>
                  {interpretation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 温暖寄语 */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.06), rgba(255,107,157,0.06))' }}>
        <div className="card-title">💌 写给{userName}的话</div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text)' }}>
          完整走完这次觉察，{userName}已经在认真看见、接纳、理解自己。<br />
          这份测评不会给你贴上负面标签，只是温柔告诉你：<br />
          你的敏感、多想、内敛、疲惫、慢热、防备，全部合理且正常。
        </p>
      </div>

      {/* 底部操作 */}
      <div className="result-footer-actions">
        <button className="btn btn-secondary" onClick={() => navigate(`/scale/${id}`)}>🔄 重新测试</button>
        <button className="btn btn-secondary" onClick={() => navigate('/scales')}>📋 查看报告</button>
        <button className="btn btn-ghost" onClick={handleDelete} style={{ color: '#ff4757' }}>🗑️ 删除报告</button>
      </div>
    </div>
  );
}
