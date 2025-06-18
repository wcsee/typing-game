import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

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
  };

  // 使用ref保存最新的状态值
  const gameStateRef = useRef({ gameStarted, gameOver, currentInput, moles, score, level });
  gameStateRef.current = { gameStarted, gameOver, currentInput, moles, score, level };

  // 处理键盘输入
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { gameStarted, gameOver, currentInput, moles, score, level } = gameStateRef.current;
    if (!gameStarted || gameOver) return;
    
    // 防止修饰键（Shift、Ctrl、Alt等）干扰输入
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    const key = e.key.toLowerCase();
    if (key.match(/^[a-z]$/)) {
      // 防止事件冒泡和默认行为
      e.preventDefault();
      
      const newInput = currentInput + key;
      setCurrentInput(newInput);
      
      // 检查是否匹配任何可见地鼠的单词
      const visibleMoles = moles.filter(mole => mole.isVisible);
      const matchedMole = visibleMoles.find(mole => mole.word === newInput);
      
      if (matchedMole) {
        // 击中地鼠 - 添加击中效果
        setMoles(prev => prev.map(mole => 
          mole.id === matchedMole.id 
            ? { ...mole, isVisible: false } 
            : mole
        ));
        
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
        const hasValidPrefix = visibleMoles.some(mole => mole.word.startsWith(newInput));
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
    if (gameStarted && !gameOver) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameStarted, gameOver, handleKeyPress]);

  // 游戏计时器
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setGameStarted(false);
    }
  }, [gameStarted, gameOver, timeLeft]);

  // 地鼠生成器
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // 生成间隔随等级递减，最快每500毫秒生成一只
      const spawnInterval = Math.max(2500 - (level - 1) * 20, 500);
      const interval = setInterval(spawnMole, spawnInterval);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, level, spawnMole]);

  return (
    <div className="App">
      <div className="game-header">
        <h1>🐹 打地鼠打字练习</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">得分:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">时间:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">等级:</span>
            <span className="stat-value">{level}/100</span>
          </div>
          <div className="stat">
            <span className="stat-label">练习:</span>
            <span className="stat-value">
              {level <= 10 ? '字母' : 
               level <= 30 ? '简单' :
               level <= 60 ? '中等' :
               level <= 85 ? '困难' : '超难'}
            </span>
          </div>
        </div>
      </div>

      <div className="game-area">
        {!gameStarted && !gameOver && (
          <div className="game-start">
            <h2>🎯 《打地鼠》打字练习游戏</h2>
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
