import React from 'react';
import './GameStats.css';

interface GameStatsProps {
  score: number;
  totalScore: number;
  timeLeft: number;
  level: number;
  gameMode?: 'chapter';
  currentChapter?: number;
  chapterName?: string;
}

const GameStats: React.FC<GameStatsProps> = ({ 
  score, 
  totalScore,
  timeLeft, 
  level, 
  gameMode = 'chapter',
  currentChapter,
  chapterName 
}) => {
  const getPracticeType = (chapterName?: string): string => {
    return chapterName || '未知关卡';
  };

  return (
    <div className="game-stats-sidebar">
      <div className="stat-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-content">
          <div className="stat-label">本轮得分</div>
          <div className="stat-value">{score}</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">💎</div>
        <div className="stat-content">
          <div className="stat-label">总分</div>
          <div className="stat-value">{totalScore}</div>
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
          <div className="stat-label">关卡等级</div>
          <div className="stat-value">{level}/10</div>
        </div>
      </div>
      
      {currentChapter && (
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
          <div className="stat-value">{getPracticeType(chapterName)}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;