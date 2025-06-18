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
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [chapterLevel, setChapterLevel] = useState(1);

  const [gameMode] = useState<'classic' | 'chapter'>(mode as 'classic' | 'chapter');
  const [currentChapter] = useState(selectedChapter || 1);

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
  const getWordsForLevel = useCallback((currentLevel: number, mode: string, chapter: number): string[] => {
    if (mode === 'chapter') {
      switch (chapter) {
        case 1: return LETTERS;
        case 2: return EASY_WORDS;
        case 3: return MEDIUM_WORDS;
        case 4: return HARD_WORDS;
        case 5: return EXPERT_WORDS;
        default: return EASY_WORDS;
      }
    }
    
    if (currentLevel <= 10) return LETTERS;
    if (currentLevel <= 30) return EASY_WORDS;
    if (currentLevel <= 60) return MEDIUM_WORDS;
    if (currentLevel <= 85) return HARD_WORDS;
    return EXPERT_WORDS;
  }, []);

  // 生成随机位置
  const getRandomPosition = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 70 + 15;
    return { x, y };
  };

  // 生成地鼠
  const spawnMole = useCallback(() => {
    const currentLevel = gameMode === 'chapter' ? chapterLevel : level;
    const words = getWordsForLevel(currentLevel, gameMode, currentChapter);
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

    // 根据等级调整地鼠显示时间
    const hideTime = gameMode === 'chapter' 
      ? Math.max(4000 - (currentLevel - 1) * 200, 1500)
      : Math.max(5000 - (currentLevel - 1) * 50, 2000);
    
    setTimeout(() => {
      setMoles(prev => prev.filter(mole => mole.id !== newMole.id));
    }, hideTime);
  }, [level, chapterLevel, gameMode, currentChapter, getWordsForLevel]);

  // 开始游戏
  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setMoles([]);
    setCurrentInput('');

    
    if (gameMode === 'chapter') {
      setTimeLeft(90);
      setChapterLevel(1);
    } else {
      setTimeLeft(60);
      setLevel(1);
    }

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(console.error);
    }
  }, [gameMode]);



  // 更新游戏状态引用
  useEffect(() => {
    gameStateRef.current = { gameStarted, gameOver, level, gameMode, currentChapter, chapterLevel };
  }, [gameStarted, gameOver, level, gameMode, currentChapter, chapterLevel]);

  // 键盘输入处理
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const { gameStarted, gameOver, level, gameMode, currentChapter, chapterLevel } = gameStateRef.current;
    
    if (!gameStarted || gameOver) return;

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
        
        const currentLevel = gameMode === 'chapter' ? chapterLevel : level;
        const points = 10 * currentLevel;
        setScore(prev => prev + points);
        
        if (gameMode === 'chapter') {
          if ((score + points) >= chapterLevel * 50 && chapterLevel < 10) {
            setChapterLevel(prev => prev + 1);
          }
        } else {
          if ((score + points) >= level * 50 && level < 100) {
            setLevel(prev => prev + 1);
          }
        }
        
        setCurrentInput('');
      } else if (!matchingMole) {
        setCurrentInput('');
      }
    } else if (key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (key === 'Escape') {
      setCurrentInput('');
    }
  }, [currentInput, moles, score, chapterLevel, level, gameMode]);

  // 键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 游戏计时器
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            setGameStarted(false);
            if (backgroundMusicRef.current) {
              backgroundMusicRef.current.pause();
            }
            
            // 关卡模式结束时的处理
            if (gameMode === 'chapter' && chapterLevel >= 10) {
              onChapterComplete(currentChapter);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameOver, timeLeft, gameMode, chapterLevel, currentChapter, onChapterComplete]);

  // 地鼠生成器
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const currentLevel = gameMode === 'chapter' ? chapterLevel : level;
      const baseInterval = gameMode === 'chapter' ? 2000 : 2500;
      const spawnInterval = Math.max(baseInterval - (currentLevel - 1) * 20, 500);
      const interval = setInterval(spawnMole, spawnInterval);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, level, chapterLevel, gameMode, spawnMole]);

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
            timeLeft={timeLeft} 
            level={gameMode === 'chapter' ? chapterLevel : level}
            gameMode={gameMode}
            currentChapter={gameMode === 'chapter' ? currentChapter : undefined}
            chapterName={gameMode === 'chapter' ? currentChapterInfo?.name : undefined}
          />
        )}
        
        <div className="game-area">

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

          {gameOver && (
            <div className="game-over">
              <h2>游戏结束！</h2>
              <p>最终得分: {score}</p>
              {gameMode === 'chapter' ? (
                <>
                  <p>关卡: {currentChapterInfo?.name}</p>
                  <p>关卡等级: {chapterLevel}/10</p>
                  {chapterLevel >= 10 && (
                    <p className="success-message">🎉 恭喜完成关卡！</p>
                  )}
                </>
              ) : (
                <p>达到等级: {level}</p>
              )}
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