import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { getUserName, setUserName, getCompletedScales, getUnlockedMonths, getOverallProfile } from '../store/store';
import { SCALES } from '../data/scales';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function HomePage() {
  const [userName, setLocalName] = useState(getUserName() || '');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [completed, setCompleted] = useState({});
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [profile, setProfile] = useState({});
  const [selectedScaleId, setSelectedScaleId] = useState(null);
  const [supportAmount, setSupportAmount] = useState('9.9');

  useEffect(() => {
    const completedData = getCompletedScales();
    setCompleted(completedData);
    setUnlockedCount(getUnlockedMonths().length);
    setProfile(getOverallProfile());
    // 默认选中第一个已完成的量表
    const completedIds = Object.keys(completedData);
    if (completedIds.length > 0 && !selectedScaleId) {
      setSelectedScaleId(completedIds[0]);
    }
  }, [selectedScaleId]);

  const handleSaveName = () => {
    setUserName(tempName.trim() || '我的成长名片');
    setLocalName(tempName.trim() || '我的成长名片');
    setEditing(false);
  };

  // 获取选中量表的雷达图数据
  const getSelectedScaleRadarData = () => {
    if (!selectedScaleId || !completed[selectedScaleId]) return null;
    
    const scale = SCALES.find(s => s.id === selectedScaleId);
    if (!scale) return null;
    
    const results = completed[selectedScaleId].results;
    const labels = scale.dimensions.map(d => d.label);
    const values = scale.dimensions.map(d => results[d.key] || 0);
    
    return {
      labels,
      datasets: [{
        label: scale.title,
        data: values,
        backgroundColor: `${scale.color}33`,
        borderColor: scale.color,
        borderWidth: 2,
        pointBackgroundColor: scale.color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: scale.color,
      }],
    };
  };

  const selectedRadarData = getSelectedScaleRadarData();
  const selectedScale = selectedScaleId ? SCALES.find(s => s.id === selectedScaleId) : null;

  const completedCount = Object.keys(completed).length;
  const completedScales = Object.keys(completed).map(id => SCALES.find(s => s.id === id)).filter(Boolean);

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25, font: { size: 10 }, backdropColor: 'transparent' },
        grid: { color: 'rgba(108, 99, 255, 0.1)' },
        pointLabels: { font: { size: 11, weight: '600' }, color: '#4a5568' },
        angleLines: { color: 'rgba(108, 99, 255, 0.1)' },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="page-container">
      {/* 顶部 Banner */}
      <div className="home-banner">
        <div className="banner-inner">
          <div className="banner-left">
            <div className="avatar-circle">
              {userName ? userName.charAt(0) : '🌱'}
            </div>
            <div className="banner-info">
              {editing ? (
                <div className="name-edit">
                  <input
                    className="name-input"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    placeholder="输入你的名字"
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSaveName}>保存</button>
                </div>
              ) : (
                <div className="name-display">
                  <h1 className="user-name">{userName || '我的成长名片'}</h1>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setTempName(userName); setEditing(true); }}>
                    ✏️ 编辑
                  </button>
                </div>
              )}
              <p className="banner-subtitle">持续成长，看见自己的变化 🌱</p>
            </div>
          </div>
          <div className="banner-right">
            <div className="stat-pill">
              <span className="stat-icon">📋</span>
              <span className="stat-num">{completedCount}</span>
              <span className="stat-label">已测</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🌸</span>
              <span className="stat-num">{unlockedCount}</span>
              <span className="stat-label">已种</span>
            </div>
          </div>
        </div>
      </div>

      {/* 成长雷达图 */}
      <div className="card profile-card">
        <div className="card-title">🌟 个人成长维度图</div>
        {completedCount > 0 ? (
          <div className="profile-layout">
            {/* 左侧：量表选择器 */}
            <div className="scale-selector">
              <div className="selector-label">选择量表</div>
              <div className="scale-list">
                {completedScales.map(scale => (
                  <button
                    key={scale.id}
                    className={`scale-item ${selectedScaleId === scale.id ? 'active' : ''}`}
                    onClick={() => setSelectedScaleId(scale.id)}
                  >
                    <span className="scale-icon">{scale.icon}</span>
                    <span className="scale-name">{scale.title}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* 右侧：雷达图 */}
            <div className="radar-container">
              {selectedRadarData ? (
                <>
                  <div className="radar-wrapper">
                    <Radar data={selectedRadarData} options={radarOptions} />
                  </div>
                  <p className="radar-hint">{selectedScale?.title} · {selectedScale?.dimensions.length}个维度</p>
                </>
              ) : (
                <div className="empty-state">
                  <span className="emoji">📊</span>
                  <p>选择一个量表查看维度图</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="emoji">📊</span>
            <p>还没有完成任何测试</p>
            <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginTop: 8 }}>
              开始测试，解锁你的成长维度图
            </p>
          </div>
        )}
      </div>

      {/* 打赏支持 */}
      <div className="card support-card">
        <div className="card-title">☕ 支持开发者</div>
        <p className="support-hint">如果这个工具对你有帮助，欢迎请我喝杯咖啡</p>
        <div className="support-options">
          {['9.9', '19.9', '29.9'].map(amount => (
            <button
              key={amount}
              className={`support-btn ${supportAmount === amount ? 'active' : ''}`}
              onClick={() => setSupportAmount(amount)}
            >
              <span className="support-price">¥{amount}</span>
              <span className="support-label">
                {amount === '9.9' ? '一杯奶茶' : amount === '19.9' ? '一份便当' : '一杯咖啡'}
              </span>
            </button>
          ))}
        </div>
        <div className="support-qr">
          <img src={`/qr-${supportAmount}.jpg`} alt="打赏二维码" className="qr-image" />
          <p className="qr-hint">扫码打赏 ¥<span className="qr-amount">{supportAmount}</span></p>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-actions">
        <Link to="/scales" className="action-card action-scale">
          <span className="action-emoji">📋</span>
          <div>
            <div className="action-title">个人成长测试</div>
            <div className="action-desc">探索你的身心状态与内在成长</div>
          </div>
          <span className="action-arrow">→</span>
        </Link>
        <Link to="/garden" className="action-card action-garden">
          <span className="action-emoji">🌻</span>
          <div>
            <div className="action-title">成长花园</div>
            <div className="action-desc">每完成一次测试，种下一朵花</div>
          </div>
          <span className="action-arrow">→</span>
        </Link>
      </div>

      {/* 最近完成 */}
      {completedCount > 0 && (
        <div className="card">
          <div className="card-title">📝 最近完成</div>
          <div className="recent-list">
            {Object.entries(completed).slice(-3).reverse().map(([id, record]) => (
              <div key={id} className="recent-item">
                <span className="recent-dot"></span>
                <div className="recent-info">
                  <span className="recent-title">身心状态觉察量表</span>
                  <span className="recent-date">{new Date(record.date).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
