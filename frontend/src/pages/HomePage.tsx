import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './HomePage.css';

interface Chapter {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  maxLevel: number;
}

interface HomePageProps {
  chapters: Chapter[];
  onChapterSelect: (chapterId: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({ chapters, onChapterSelect }) => {
  const navigate = useNavigate();

  const handleChapterClick = (chapter: Chapter) => {
    if (chapter.unlocked) {
      onChapterSelect(chapter.id);
      navigate('/game');
    }
  };

  return (
    <div className="home-page">
      <Header/>
      <div className="home-content">
        <div className="chapter-selection">
          <h2>选择关卡</h2>
          <div className="chapter-grid">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`chapter-button ${
                  !chapter.unlocked ? 'locked' : chapter.completed ? 'completed' : 'unlocked'
                }`}
                onClick={() => handleChapterClick(chapter)}
              >
                <div className="chapter-name">{chapter.name}</div>
                <div className="chapter-description">{chapter.description}</div>
                <div className="chapter-progress">
                  等级: 1-{chapter.maxLevel}
                </div>
                <div className={`chapter-status ${
                  !chapter.unlocked ? 'locked' : chapter.completed ? 'completed' : 'unlocked'
                }`}>
                  {!chapter.unlocked ? '🔒 未解锁' : chapter.completed ? '✅ 已完成' : '🎯 可挑战'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="game-features">
          <h2>游戏特色</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">快速反应</div>
              <div className="feature-description">训练手指反应速度和键盘熟练度</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <div className="feature-title">精准打字</div>
              <div className="feature-description">提高打字准确性，减少错误率</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <div className="feature-title">渐进式学习</div>
              <div className="feature-description">从简单到复杂，循序渐进提升技能</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <div className="feature-title">趣味游戏</div>
              <div className="feature-description">寓教于乐，让学习变得有趣</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;