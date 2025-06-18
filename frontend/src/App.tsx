import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import './App.css';

interface Chapter {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  maxLevel: number;
}

const App: React.FC = () => {
  // 关卡状态管理
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 1,
      name: '字母练习',
      description: '练习单个字母的输入，适合初学者建立基础',
      unlocked: true,
      completed: false,
      maxLevel: 10
    },
    {
      id: 2,
      name: '简单词汇',
      description: '练习常用的简单单词，提升基本打字技能',
      unlocked: false,
      completed: false,
      maxLevel: 10
    },
    {
      id: 3,
      name: '中等词汇',
      description: '挑战中等长度的单词，增强打字流畅度',
      unlocked: false,
      completed: false,
      maxLevel: 10
    },
    {
      id: 4,
      name: '困难词汇',
      description: '练习复杂单词，提升高级打字技能',
      unlocked: false,
      completed: false,
      maxLevel: 10
    },
    {
      id: 5,
      name: '超难词汇',
      description: '挑战最复杂的单词，成为打字高手',
      unlocked: false,
      completed: false,
      maxLevel: 10
    }
  ]);

  const [selectedChapter, setSelectedChapter] = useState<number | undefined>();

  // 处理关卡选择
  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
  };

  // 处理关卡完成
  const handleChapterComplete = (chapterId: number) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.id === chapterId) {
        return { ...chapter, completed: true };
      }
      if (chapter.id === chapterId + 1) {
        return { ...chapter, unlocked: true };
      }
      return chapter;
    }));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                chapters={chapters} 
                onChapterSelect={handleChapterSelect}
              />
            } 
          />
          <Route 
            path="/game" 
            element={
              <GamePage 
                chapters={chapters}
                selectedChapter={selectedChapter}
                onChapterComplete={handleChapterComplete}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
