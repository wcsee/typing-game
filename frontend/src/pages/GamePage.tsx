import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameStats from '../components/GameStats';
import './GamePage.css';

interface Mole {
  id: number;
  word: string;
  x: number;
  y: number;
  visible: boolean;
}

interface Chapter {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  maxLevel: number;
}

interface GamePageProps {
  chapters: Chapter[];
  selectedChapter?: number;
  onChapterComplete: (chapterId: number) => void;
}

const GamePage: React.FC<GamePageProps> = ({ chapters, selectedChapter, onChapterComplete }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'chapter';
  
  // 词汇列表
  const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  const EASY_WORDS = ['cat', 'dog', 'sun', 'car', 'book', 'tree', 'fish', 'bird', 'cake', 'ball', 'home', 'love', 'time', 'hand', 'face'];
  const MEDIUM_WORDS = ['computer', 'keyboard', 'monitor', 'internet', 'software', 'hardware', 'program', 'website', 'database', 'network'];
  const HARD_WORDS = ['programming', 'development', 'technology', 'algorithm', 'architecture', 'framework', 'optimization', 'debugging', 'implementation'];
  const EXPERT_WORDS = ['asynchronous', 'polymorphism', 'encapsulation', 'inheritance', 'abstraction', 'methodology', 'infrastructure', 'authentication', 'authorization'];

  // 游戏状态
  const [moles, setMoles] = useState<Mole[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [chapterLevel, setChapterLevel] = useState(1);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  const [gameMode] = useState<'chapter'>('chapter');
  const [currentChapter] = useState(selectedChapter || 1);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);

  // 音频引用
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const hitSoundRef = useRef<HTMLAudioElement>(null);
  const gameStateRef = useRef({ gameStarted: false, gameOver: false, level: 1, gameMode: 'classic' as 'classic' | 'chapter', currentChapter: 1, chapterLevel: 1 });

  // 初始化音频
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = 0.3;
      backgroundMusicRef.current.loop = true;
    }
    if (hitSoundRef.current) {
      hitSoundRef.current.volume = 0.5;
    }
  }, []);

  // 根据等级获取词汇
  const getWordsForLevel = useCallback((currentLevel: number, chapter: number): string[] => {
    switch (chapter) {
      case 1: return LETTERS;
      case 2: return EASY_WORDS;
      case 3: return MEDIUM_WORDS;
      case 4: return HARD_WORDS;
      case 5: return EXPERT_WORDS;
      default: return EASY_WORDS;
    }
  }, []);

  // 生成随机位置
  const getRandomPosition = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 70 + 15;
    return { x, y };
  };

  // 生成地鼠
  const spawnMole = useCallback(() => {
    const words = getWordsForLevel(chapterLevel, currentChapter);
    const word = words[Math.floor(Math.random() * words.length)];
    const position = getRandomPosition();
    const newMole: Mole = {
      id: Date.now(),
      word,
      x: position.x,
      y: position.y,
      visible: true
    };

    setMoles(prev => [...prev, newMole]);

    // 根据等级调整地鼠显示时间，每级减少150ms
    const hideTime = Math.max(4000 - (chapterLevel - 1) * 150, 1000);
    
    setTimeout(() => {
      setMoles(prev => prev.filter(mole => mole.id !== newMole.id));
    }, hideTime);
  }, [chapterLevel, currentChapter, getWordsForLevel]);

  // 开始游戏
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTotalScore(0);
    setMoles([]);
    setCurrentInput('');
    setTimeLeft(60);
    setChapterLevel(1);
    setChapterCompleted(false);
    setShowLevelUpEffect(false);

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(console.error);
    }
  }, []);



  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    setGamePaused(prev => !prev);
    if (backgroundMusicRef.current) {
      if (gamePaused) {
        backgroundMusicRef.current.play().catch(console.error);
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [gamePaused]);

  // 更新游戏状态引用
  useEffect(() => {
    gameStateRef.current = { gameStarted, gameOver, level, gameMode: 'chapter', currentChapter, chapterLevel };
  }, [gameStarted, gameOver, level, currentChapter, chapterLevel]);

  // 键盘输入处理
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const { gameStarted, gameOver, level, gameMode, currentChapter, chapterLevel } = gameStateRef.current;
    
    if (!gameStarted || gameOver || gamePaused || showLevelUpEffect || chapterCompleted) return;

    const key = event.key;
    
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      const newInput = currentInput + key.toUpperCase();
      setCurrentInput(newInput);
      
      const matchingMole = moles.find(mole => 
        mole.visible && mole.word.toUpperCase().startsWith(newInput)
      );
      
      if (matchingMole && matchingMole.word.toUpperCase() === newInput) {
        if (hitSoundRef.current) {
          hitSoundRef.current.currentTime = 0;
          hitSoundRef.current.play().catch(console.error);
        }
        
        // 标记地鼠为不可见
        setMoles(prev => prev.map(mole => 
          mole.id === matchingMole.id 
            ? { ...mole, visible: false }
            : mole
        ));
        
        // 延迟移除地鼠以显示击中动画
        setTimeout(() => {
          setMoles(prev => prev.filter(mole => mole.id !== matchingMole.id));
        }, 500);
        
        // 新的计分规则：1 x 等级分数
        const points = 1 * chapterLevel;
        
        // 更新总分
        setTotalScore(prev => prev + points);
        
        setScore(prev => {
           const newScore = prev + points;
           // 新的升级条件：20 x 当前等级分数
           if (newScore >= chapterLevel * 20 && chapterLevel < 10) {
             setChapterLevel(prevLevel => {
               const nextLevel = prevLevel + 1;
               // 显示升级庆祝效果
               setShowLevelUpEffect(true);
               setTimeout(() => setShowLevelUpEffect(false), 3000);
               // 升级时重置分数和时间
               setTimeLeft(60);
               return nextLevel;
             });
             // 升级时分数重置为0
             return 0;
           } else if (newScore >= chapterLevel * 20 && chapterLevel >= 10) {
             // 达到10级，关卡完成
             setChapterCompleted(true);
             setGameOver(true);
             if (backgroundMusicRef.current) {
               backgroundMusicRef.current.pause();
             }
             // 调用关卡完成回调
             onChapterComplete(currentChapter);
             return newScore;
           }
           return newScore;
         });
        
        setCurrentInput('');
      } else if (!matchingMole) {
        setCurrentInput('');
      }
    } else if (key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (key === 'Escape') {
      setCurrentInput('');
    }
  }, [currentInput, moles, score, chapterLevel, level, gameMode, gamePaused, showLevelUpEffect, chapterCompleted]);

  // 键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 游戏计时器
  useEffect(() => {
    if (gameStarted && !gameOver && !gamePaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            setGameStarted(false);
            if (backgroundMusicRef.current) {
              backgroundMusicRef.current.pause();
            }
            
            // 关卡模式结束时的处理
            if (chapterLevel >= 10) {
              onChapterComplete(currentChapter);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameOver, gamePaused, timeLeft, gameMode, chapterLevel, currentChapter, onChapterComplete]);

  // 地鼠生成器
  useEffect(() => {
    if (gameStarted && !gameOver && !gamePaused && !showLevelUpEffect && !chapterCompleted) {
      // 基础生成间隔2000ms，每级减少100ms，最低300ms
      const spawnInterval = Math.max(2000 - (chapterLevel - 1) * 100, 300);
      
      // 每级增加地鼠数量：等级1-3时每次生成1个，等级4-6时2个，等级7-10时3个
      const molesPerSpawn = chapterLevel <= 3 ? 1 : chapterLevel <= 6 ? 2 : 3;
      
      const interval = setInterval(() => {
        for (let i = 0; i < molesPerSpawn; i++) {
          setTimeout(() => spawnMole(), i * 200); // 每个地鼠间隔200ms生成
        }
      }, spawnInterval);
      
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, gamePaused, showLevelUpEffect, chapterCompleted, chapterLevel, spawnMole]);

  // 自动开始游戏
  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleBackToHome = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
    navigate('/');
  };

  const currentChapterInfo = chapters.find(c => c.id === currentChapter);

  return (
    <div className="game-page">
      <Header showBackButton={true} onBackClick={handleBackToHome} />
      
      {/* 音频元素 */}
      <audio ref={backgroundMusicRef} src="/background-music.mp3" />
      <audio ref={hitSoundRef} src="/hit-sound.mp3" />
      
      <div className="game-container">
        {gameStarted && (
          <GameStats 
          score={score} 
          totalScore={totalScore}
          timeLeft={timeLeft} 
          level={chapterLevel}
          gameMode={gameMode}
          currentChapter={currentChapter}
          chapterName={currentChapterInfo?.name}
        />
        )}
        
        <div className="game-area">
          {/* 暂停/继续按钮 */}
          {gameStarted && !gameOver && (
            <button 
              className="pause-toggle-button" 
              onClick={togglePause}
              title={gamePaused ? '继续游戏' : '暂停游戏'}
            >
              {gamePaused ? '▶️' : '⏸️'}
              <span>{gamePaused ? '继续' : '暂停'}</span>
            </button>
          )}
          
          {/* 升级庆祝效果 */}
          {showLevelUpEffect && (
            <div className="level-up-effect">
              <div className="fireworks">
                <div className="firework">🎆</div>
                <div className="firework">🎇</div>
                <div className="firework">✨</div>
                <div className="firework">🎉</div>
                <div className="firework">🎊</div>
              </div>
              <div className="level-up-message">
                <h2>🎉 升级了！🎉</h2>
                <p>等级 {chapterLevel}</p>
              </div>
            </div>
          )}

          <div className="moles-container">
            {moles.map(mole => (
              <div
                key={mole.id}
                className={`mole ${!mole.visible ? 'hit' : ''}`}
                style={{
                  left: `${mole.x}%`,
                  top: `${mole.y}%`
                }}
              >
                <div className="mole-emoji">🐹</div>
                <div className="mole-word">{mole.word}</div>
              </div>
            ))}
          </div>

          {gamePaused && (
            <div className="pause-overlay">
              <div className="pause-message">
                <h2>游戏已暂停</h2>
                <p>点击继续按钮恢复游戏</p>
                <button className="resume-button" onClick={togglePause}>
                  继续游戏
                </button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="game-over">
              {chapterCompleted ? (
                <>
                  <h2>🎉 关卡完成！</h2>
                  <p className="success-message">恭喜您完成了 {currentChapterInfo?.name} 关卡！</p>
                  <p>已达到最高等级 10 级</p>
                </>
              ) : (
                <h2>游戏结束！</h2>
              )}
              <p>本轮得分: {score}</p>
              <p>总分: {totalScore}</p>
              <p>关卡: {currentChapterInfo?.name}</p>
              <p>关卡等级: {chapterLevel}/10</p>
              <div className="game-over-buttons">
                <button className="restart-button" onClick={startGame}>
                  再玩一次
                </button>
                <button className="home-button" onClick={handleBackToHome}>
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GamePage;