import React from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

const Profile = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  return (
    <div className="profile-container">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>👤 Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="profile-card">
          <div className="user-info-section">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-details">
              <h2>Welcome, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}!</h2>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
