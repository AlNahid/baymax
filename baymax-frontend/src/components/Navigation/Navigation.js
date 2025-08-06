import React from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, setCurrentPage }) => {
  const handleNavigation = (page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>Baymax</h2>
        </div>
        <div className="nav-links">
          <button 
            onClick={() => handleNavigation('home')} 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            Home
          </button>
          <button 
            onClick={() => handleNavigation('add')} 
            className={`nav-link ${currentPage === 'add' ? 'active' : ''}`}
          >
            <span className="nav-icon">➕</span>
            Add
          </button>
          <button 
            onClick={() => handleNavigation('track')} 
            className={`nav-link ${currentPage === 'track' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            Track
          </button>
          <button 
            onClick={() => handleNavigation('profile')} 
            className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
        </div>
        <div className="nav-notification">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
