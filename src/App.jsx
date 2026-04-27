import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import './index.css';
import './App.css';
import HomePage from './pages/HomePage';
import GardenPage from './pages/GardenPage';
import ScalesListPage from './pages/ScalesListPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import { clearGardenData } from './store/store';

function App() {
  // 启动时清空花园数据
  useEffect(() => {
    clearGardenData();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/garden" element={<GardenPage />} />
          <Route path="/scales" element={<ScalesListPage />} />
          <Route path="/scale/:id" element={<QuizPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
        </Routes>

        <nav className="bottom-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">首页</span>
          </NavLink>
          <NavLink to="/scales" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📋</span>
            <span className="nav-label">测试</span>
          </NavLink>
          <NavLink to="/garden" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">🌻</span>
            <span className="nav-label">花园</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;
