import React, { useState } from 'react';
import './App.css';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Home from './pages/Home';
import AddMedicine from './pages/AddMedicine';
import TrackMedicine from './pages/TrackMedicine';
import UpdateMedicine from './pages/UpdateMedicine';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

// Main App Component with Authentication
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  // If not authenticated, show login/signup pages
  if (!isAuthenticated) {
    const renderAuthPage = () => {
      switch(currentPage) {
        case 'signup':
          return <SignUp onNavigate={setCurrentPage} />;
        case 'login':
          return <Login onNavigate={setCurrentPage} />;
        default:
          return <Login onNavigate={setCurrentPage} />;
      }
    };

    return (
      <div className="App">
        {renderAuthPage()}
      </div>
    );
  }

  // If authenticated, show main app pages
  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      case 'add':
        return <AddMedicine currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      case 'track':
        return <TrackMedicine 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          setSelectedMedicineId={setSelectedMedicineId}
        />;
      case 'update':
        return <UpdateMedicine 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          medicineId={selectedMedicineId}
        />;
      case 'profile':
        return <Profile currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      default:
        return <Home currentPage={currentPage} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
