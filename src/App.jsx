import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VotingProvider, useVoting } from './contexts/VotingContext';
import ShareholderCheck from './ShareholderCheck';
import PreSuccess from './pages/Presuccess';
import Success from './pages/Success';
import RegisteredHolders from './pages/RegisteredHolders';
import Header from './Header';
import Footer from './Footer';
import './pages/RegisteredHolders.css';
import UserTypeSelection from './pages/UserTypeSelection';
import GuestRegistration from './pages/GuestRegistration';
import GuestSuccess from './pages/GuestSuccess';
import VotingStatusAdmin from './components/VotingStatusAdmin';

// Simple admin component to test voting status changes
const AdminControls = () => {
  const { votingStatus, updateVotingStatus } = useVoting();
  
  const toggleVoting = async () => {
    try {
      await updateVotingStatus(!votingStatus.isOpen);
    } catch (error) {
      console.error('Failed to update voting status:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      padding: '10px', 
      background: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000 
    }}>
      <h3>Voting Admin</h3>
      <p>Status: {votingStatus.isOpen ? 'OPEN' : 'CLOSED'}</p>
      <button 
        onClick={toggleVoting}
        style={{
          padding: '5px 10px',
          background: votingStatus.isOpen ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {votingStatus.isOpen ? 'Close Voting' : 'Open Voting'}
      </button>
    </div>
  );
};

function App() {
  const [shareholderData, setShareholderData] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple admin toggle for testing - in a real app, this would be proper authentication
  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <VotingProvider>
      <Router>
      <div className="app">
        <Header />
        
        <main className="main-content">
          <Routes>
            {/* Landing page - User type selection */}
            <Route path="/" element={<UserTypeSelection />} />
            
            {/* Shareholder flow */}
            <Route path="/shareholder" element={
              <ShareholderCheck 
                setShareholderData={setShareholderData}
              />
            } />
            <Route path="/shareholder/presuccess" element={
              shareholderData ? (
                <PreSuccess 
                  shareholderData={shareholderData}
                  onBackToHome={() => <Navigate to="/shareholder" />}
                />
              ) : (
                <Navigate to="/shareholder" />
              )
            } />
            <Route path="/shareholder/success" element={
              shareholderData ? (
                <Success 
                  shareholderData={shareholderData}
                  onBackToHome={() => <Navigate to="/" />}
                />
              ) : (
                <Navigate to="/shareholder" />
              )
            } />
            
            {/* Guest flow */}
            <Route path="/guest" element={
              <GuestRegistration 
                setGuestData={setGuestData}
              />
            } />
         
         <Route path="/guest/success" element={guestData ? (<GuestSuccess guestData={guestData} />) : (<Navigate to="/guest" />)} />

            {/* Admin/registered users */}
            <Route path="/registered-users" element={<RegisteredHolders />} />
            
            {/* Fallback routes */}
            <Route path="/registration-success" element={<Navigate to="/shareholder/success" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* <Footer /> */}
      </div>
        {isAdmin && <AdminControls />}
        <button 
          onClick={toggleAdmin}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          {isAdmin ? 'Hide Admin' : 'Show Admin'}
        </button>
      </Router>
    </VotingProvider>
  );
}

export default App;