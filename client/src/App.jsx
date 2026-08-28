import { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  // Simple page state manager for preview toggle ('login' or 'signup')
  const [currentPage, setCurrentPage] = useState('login');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full min-h-screen bg-[#030712]">
      {currentPage === 'login' ? (
        <LoginPage onNavigate={handleNavigate} />
      ) : (
        <SignupPage onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
