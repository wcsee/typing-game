import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  score: number;
  timeLeft: number;
  level: number;
}

const GameStats: React.FC<GameStatsProps> = ({ score, timeLeft, level }) => {
  const getPracticeType = (level: number): string => {
    if (level <= 10) return '字母';
    if (level <= 30) return '简单';
    if (level <= 60) return '中等';
    if (level <= 85) return '困难';
    return '超难';
  };

  return (
    <div className="game-stats-sidebar">
      <div className="stat-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-content">
          <div className="stat-label">得分</div>
          <div className="stat-value">{score}</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">⏰</div>
        <div className="stat-content">
          <div className="stat-label">时间</div>
          <div className="stat-value">{timeLeft}s</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-label">等级</div>
          <div className="stat-value">{level}/100</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-label">练习</div>
          <div className="stat-value">{getPracticeType(level)}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;