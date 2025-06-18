import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="game-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">🐹</div>
          <h1 className="game-title">《快乐打地鼠》打字练习</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;