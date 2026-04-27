import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FLOWERS, getFlowerByMonth } from '../data/flowers';
import { getUnlockedMonths, getGardenFlowers, getCompletedScales } from '../store/store';

const MONTH_NAMES = ['', '一月', '二月', '三月', '四月', '五月', '六月',
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function GardenPage() {
  const [unlockedMonths, setUnlockedMonths] = useState([]);
  const [gardenFlowers, setGardenFlowers] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    setUnlockedMonths(getUnlockedMonths());
    setGardenFlowers(getGardenFlowers());
    setCompleted(getCompletedScales());
  }, []);

  const currentMonth = new Date().getMonth() + 1;
  const completedCount = Object.keys(completed).length;

  const handleSelectFlower = (month) => {
    const flower = getFlowerByMonth(month);
    const isUnlocked = unlockedMonths.includes(month);
    setSelectedMonth({ month, flower, isUnlocked });
  };

  const totalUnlocked = unlockedMonths.length;

  return (
    <div className="page-container">
      <h1 className="page-title">🌻 成长花园</h1>
      <p className="page-subtitle">每完成一次心理测评，就种下一朵属于当月的花 🌸</p>

      {/* 统计 */}
      <div className="garden-stats card">
        <div className="garden-stat">
          <span className="garden-stat-num" style={{ color: 'var(--primary)' }}>{totalUnlocked}</span>
          <span className="garden-stat-label">已种花朵</span>
        </div>
        <div className="garden-stat-divider"></div>
        <div className="garden-stat">
          <span className="garden-stat-num" style={{ color: 'var(--accent)' }}>{12 - totalUnlocked}</span>
          <span className="garden-stat-label">待种花苞</span>
        </div>
        <div className="garden-stat-divider"></div>
        <div className="garden-stat">
          <span className="garden-stat-num" style={{ color: 'var(--success)' }}>{completedCount}</span>
          <span className="garden-stat-label">完成量表</span>
        </div>
      </div>

      {/* 12月花谱网格 */}
      <div className="garden-grid card">
        <div className="card-title" style={{ marginBottom: 16 }}>📅 十二月份花谱</div>
        <div className="flower-grid">
          {FLOWERS.map(flower => {
            const isUnlocked = unlockedMonths.includes(flower.month);
            const isCurrentMonth = flower.month === currentMonth;
            return (
              <div
                key={flower.month}
                className={`flower-cell ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrentMonth ? 'current-month' : ''}`}
                onClick={() => handleSelectFlower(flower.month)}
                style={{
                  '--flower-color': flower.color,
                }}
              >
                <div className="flower-emoji">
                  {isUnlocked ? flower.emoji : '🌱'}
                </div>
                <div className="flower-month">{MONTH_NAMES[flower.month]}</div>
                <div className="flower-name">{isUnlocked ? flower.name : '???'}</div>
                {isCurrentMonth && !isUnlocked && (
                  <div className="flower-hint">做测评解锁</div>
                )}
                {isUnlocked && (
                  <div className="flower-unlocked-dot"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 提示 */}
      <div className="garden-tip card">
        <div className="tip-icon">💡</div>
        <div>
          <div className="tip-title">如何种花？</div>
          <div className="tip-text">完成任意心理量表测评，即可解锁当月花种。<br />一年集齐12个月份的鲜花，就能拥有一座完整的成长花园！</div>
        </div>
      </div>

      {/* 花朵详情弹层 */}
      {selectedMonth && (
        <div className="flower-modal-overlay" onClick={() => setSelectedMonth(null)}>
          <div className="flower-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMonth(null)}>×</button>
            <div className="modal-flower-emoji" style={{ '--fc': selectedMonth.flower?.color }}>
              {selectedMonth.isUnlocked ? selectedMonth.flower?.emoji : '🌱'}
            </div>
            <h3 className="modal-title">
              {selectedMonth.month === currentMonth ? '🌟 ' : ''}{MONTH_NAMES[selectedMonth.month]}
            </h3>
            {selectedMonth.isUnlocked ? (
              <>
                <div className="modal-flower-name">{selectedMonth.flower?.name}</div>
                <div className="modal-flower-meaning">「{selectedMonth.flower?.meaning}」</div>
                <div className="modal-flower-season">
                  <span className="tag tag-purple">{selectedMonth.flower?.season}季花</span>
                </div>
                <div className="modal-unlock-info">
                  ✨ 已解锁 · {gardenFlowers[selectedMonth.month]?.unlockedAt
                    ? new Date(gardenFlowers[selectedMonth.month].unlockedAt).toLocaleDateString('zh-CN')
                    : '已种下'}
                </div>
              </>
            ) : (
              <div className="modal-locked">
                <p>这朵花还未解锁</p>
                <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: 4 }}>
                  {selectedMonth.month === currentMonth
                    ? '🎯 完成本月量表即可解锁'
                    : `🌱 等待 ${MONTH_NAMES[selectedMonth.month]} 的到来`}
                </p>
              </div>
            )}
            {!selectedMonth.isUnlocked && selectedMonth.month === currentMonth && (
              <Link to="/scales" className="btn btn-primary" style={{ marginTop: 16 }}>
                ▶ 去做测评解锁
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
