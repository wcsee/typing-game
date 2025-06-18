import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  score: number;
  timeLeft: number;
  level: number;
  gameMode?: 'classic' | 'chapter';
  currentChapter?: number;
  chapterName?: string;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  score, 
  timeLeft, 
  level, 
  gameMode = 'classic',
  currentChapter,
  chapterName 
}) => {
  const getPracticeType = (level: number, gameMode: string, chapterName?: string): string => {
    if (gameMode === 'chapter' && chapterName) {
      return chapterName;
    }
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
          <div className="stat-label">{gameMode === 'chapter' ? '关卡等级' : '等级'}</div>
          <div className="stat-value">
            {gameMode === 'chapter' ? `${level}/10` : `${level}/100`}
          </div>
        </div>
      </div>
      
      {gameMode === 'chapter' && currentChapter && (
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">当前关卡</div>
            <div className="stat-value">{currentChapter}/5</div>
          </div>
        </div>
      )}
      
      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-label">练习</div>
          <div className="stat-value">{getPracticeType(level, gameMode, chapterName)}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;