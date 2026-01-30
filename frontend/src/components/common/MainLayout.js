import React from 'react';
import Header from './Header';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="content-container">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
