import React from 'react';
import './Header.css';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, onBackClick }) => {
  return (
    <header className="game-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">🐹</div>
          <h1 className="game-title">《快乐打地鼠》打字练习</h1>
        </div>
        {showBackButton && (
          <button className="back-to-home-button" onClick={onBackClick}>
            🏠 返回首页
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;