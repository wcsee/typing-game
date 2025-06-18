import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import GameStats from './components/GameStats';
import Footer from './components/Footer';

interface Mole {
  id: number;
  word: string;
  isVisible: boolean;
  position: { x: number; y: number };
}

// 字母练习 (等级 1-10)
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

// 简单单词 (等级 11-30)
const EASY_WORDS = [
  'cat', 'dog', 'run', 'sun', 'fun', 'big', 'red', 'yes', 'no', 'go',
  'up', 'me', 'we', 'he', 'she', 'it', 'am', 'is', 'are', 'the',
  'and', 'but', 'can', 'get', 'has', 'had', 'him', 'her', 'how', 'man'
];

// 中等单词 (等级 31-60)
const MEDIUM_WORDS = [
  'apple', 'house', 'water', 'happy', 'world', 'great', 'small', 'right', 'think', 'where',
  'every', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through',
  'when', 'much', 'your', 'work', 'life', 'only', 'way', 'may', 'say', 'each',
  'which', 'their', 'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then'
];

// 困难单词 (等级 61-85)
const HARD_WORDS = [
  'beautiful', 'important', 'different', 'following', 'complete', 'several', 'children', 'interest', 'example', 'together',
  'remember', 'something', 'without', 'another', 'between', 'through', 'during', 'against', 'nothing', 'someone',
  'around', 'usually', 'however', 'problem', 'service', 'question', 'because', 'possible', 'though', 'system',
  'program', 'thought', 'process', 'provide', 'require', 'suggest', 'develop', 'consider', 'appear', 'result'
];

// 超难单词 (等级 86-100)
const EXPERT_WORDS = [
  'extraordinary', 'responsibility', 'understanding', 'communication', 'international', 'representative', 'characteristic', 'administration', 'environmental', 'technological',
  'psychological', 'philosophical', 'mathematical', 'geographical', 'archaeological', 'astronomical', 'meteorological', 'anthropological', 'physiological', 'sociological',
  'entrepreneurship', 'incomprehensible', 'disproportionate', 'uncharacteristic', 'counterproductive', 'interdisciplinary', 'multidimensional', 'unconventional', 'indistinguishable', 'incompatible'
];

function App() {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // 音频引用
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  // 音频初始化
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = 0.3; // 设置背景音乐音量为30%
    }
    if (hitSoundRef.current) {
      hitSoundRef.current.volume = 0.5; // 设置击中音效音量为50%
    }
  }, []);

  // 根据等级获取对应的单词库
  const getWordsForLevel = (level: number): string[] => {
    if (level <= 10) {
      return LETTERS;
    } else if (level <= 30) {
      return EASY_WORDS;
    } else if (level <= 60) {
      return MEDIUM_WORDS;
    } else if (level <= 85) {
      return HARD_WORDS;
    } else {
      return EXPERT_WORDS;
    }
  };

  // 生成随机位置 - 确保地鼠完全在可视区域内
  const generateRandomPosition = () => {
    return {
      x: Math.random() * 70 + 10, // 10% to 80% of screen width (留更多边距)
      y: Math.random() * 50 + 20  // 20% to 70% of screen height (留更多边距)
    };
  };

  // 生成新地鼠
  const spawnMole = useCallback(() => {
    const currentWords = getWordsForLevel(level);
    const newMole: Mole = {
      id: Date.now() + Math.random(),
      word: currentWords[Math.floor(Math.random() * currentWords.length)],
      isVisible: true,
      position: generateRandomPosition()
    };
    
    setMoles(prev => [...prev, newMole]);
    
    // 地鼠显示时间根据等级调整，最高等级时最短1秒
    const hideTime = Math.max(4000 - (level - 1) * 30, 1000);
    setTimeout(() => {
      setMoles(prev => prev.filter(mole => mole.id !== newMole.id));
    }, hideTime);
  }, [level]);

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setMoles([]);
    setCurrentInput('');
    
    // 播放背景音乐
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch(console.error);
    }
  };

  // 暂停/继续游戏功能
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => {
        const newPausedState = !prev;
        
        // 控制背景音乐
        if (backgroundMusicRef.current) {
          if (newPausedState) {
            backgroundMusicRef.current.pause();
          } else {
            backgroundMusicRef.current.play().catch(console.error);
          }
        }
        
        return newPausedState;
      });
    }
  };

  // 使用ref保存最新的状态值
  const gameStateRef = useRef<{
    gameStarted: boolean;
    gameOver: boolean;
    currentInput: string;
    moles: Mole[];
    score: number;
    level: number;
    isPaused: boolean;
  }>({ gameStarted, gameOver, currentInput, moles, score, level, isPaused });
  gameStateRef.current = { gameStarted, gameOver, currentInput, moles, score, level, isPaused };

  // 处理键盘输入
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { gameStarted, gameOver, currentInput, moles, score, level, isPaused } = gameStateRef.current;
    if (!gameStarted || gameOver || isPaused) return;
    
    // 防止修饰键（Shift、Ctrl、Alt等）干扰输入
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const key = e.key.toLowerCase();
    if (key.match(/^[a-z]$/)) {
      // 防止事件冒泡和默认行为
      e.preventDefault();
      
      const newInput = currentInput + key;
      setCurrentInput(newInput);
      
      // 检查是否匹配任何可见地鼠的单词
      const visibleMoles = moles.filter((mole: Mole) => mole.isVisible);
      const matchedMole = visibleMoles.find((mole: Mole) => mole.word === newInput);
      
      if (matchedMole) {
        // 击中地鼠 - 添加击中效果
        setMoles(prev => prev.map(mole => 
          mole.id === matchedMole.id 
            ? { ...mole, isVisible: false } 
            : mole
        ));
        
        // 播放击中音效
        if (hitSoundRef.current) {
          hitSoundRef.current.currentTime = 0;
          hitSoundRef.current.play().catch(console.error);
        }
        
        // 延迟移除地鼠以显示消失动画
        setTimeout(() => {
          setMoles(prev => prev.filter(mole => mole.id !== matchedMole.id));
        }, 500);
        
        setScore(prev => prev + 10 * level);
        setCurrentInput('');
        
        // 升级逻辑：每50分升一级，最高100级
        if ((score + 10 * level) % 50 === 0 && level < 100) {
          setLevel(prev => prev + 1);
        }
      } else {
        // 检查当前输入是否是任何可见地鼠单词的开头
        const hasValidPrefix = visibleMoles.some((mole: Mole) => mole.word.startsWith(newInput));
        if (!hasValidPrefix && newInput.length > 0) {
          // 如果输入不匹配任何可见地鼠的开头，清空输入
          setCurrentInput('');
        }
      }
    } else if (key === 'backspace') {
      e.preventDefault();
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (key === 'escape') {
      e.preventDefault();
      setCurrentInput('');
    }
  }, []);
  
  // 监听键盘事件
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameStarted, gameOver, isPaused, handleKeyPress]);

  // 游戏计时器
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setGameStarted(false);
      
      // 游戏结束时停止背景音乐
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    }
  }, [gameStarted, gameOver, isPaused, timeLeft]);

  // 地鼠生成器
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      // 生成间隔随等级递减，最快每500毫秒生成一只
      const spawnInterval = Math.max(2500 - (level - 1) * 20, 500);
      const interval = setInterval(spawnMole, spawnInterval);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, isPaused, level, spawnMole]);

  return (
    <div className="App">
      <Header />
      {gameStarted && <GameStats score={score} timeLeft={timeLeft} level={level} />}
      {gameStarted && !gameOver && (
        <button className="pause-button" onClick={togglePause}>
          {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
      )}

      <div className="game-area">
        {!gameStarted && !gameOver && (
          <div className="game-start">
            <h2>🎯 《快乐打地鼠》打字练习</h2>
            <div className="game-rules">
              <p><strong>📚 等级系统 (共100级):</strong></p>
              <p>• 等级 1-10: 字母练习 (a-z)</p>
              <p>• 等级 11-30: 简单单词</p>
              <p>• 等级 31-60: 中等单词</p>
              <p>• 等级 61-85: 困难单词</p>
              <p>• 等级 86-100: 超难单词</p>
              <br/>
              <p><strong>🎮 游戏规则:</strong></p>
              <p>• 输入出现的字母/单词来击打地鼠</p>
              <p>• 每击中一只地鼠得到 10 × 等级 分</p>
              <p>• 每50分升一级，挑战更高难度</p>
            </div>
            <button className="start-button" onClick={startGame}>
              开始挑战
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-over">
            <h2>游戏结束！</h2>
            <p>最终得分: {score}</p>
            <p>达到等级: {level}</p>
            <button className="start-button" onClick={startGame}>
              再玩一次
            </button>
          </div>
        )}

        {gameStarted && (
          <>
            <div className="moles-container">
              {moles.map(mole => (
                <div
                  key={mole.id}
                  className={`mole ${!mole.isVisible ? 'hit' : ''}`}
                  style={{
                    left: `${mole.position.x}%`,
                    top: `${mole.position.y}%`
                  }}
                >
                  <div className="mole-emoji">🐹</div>
                  <div className="mole-word">{mole.word}</div>
                </div>
              ))}
            </div>
            {isPaused && (
              <div className="pause-overlay">
                <div className="pause-message">
                  <h2>⏸️ 游戏已暂停</h2>
                  <p>点击右上角继续按钮恢复游戏</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      
      {/* 音频元素 */}
      <audio
        ref={backgroundMusicRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/background-music.mp3" type="audio/mpeg" />
        您的浏览器不支持音频播放。
      </audio>
      
      <audio
        ref={hitSoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/hit-sound.mp3" type="audio/mpeg" />
        您的浏览器不支持音频播放。
      </audio>
    </div>
  );
}

export default App;
