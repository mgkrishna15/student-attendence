import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-content">
        <h2 className="header-title">{title}</h2>
        <div className="header-date">{today}</div>
      </div>
    </header>
  );
};

export default Header;