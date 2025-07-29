import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
  const [votingStatus, setVotingStatus] = useState({
    isOpen: false,
    lastUpdated: null,
    isLoading: true,
    error: null
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initial fetch of voting status
    const fetchVotingStatus = async () => {
      try {
        const response = await axios.get('https://api.mbenefit.apel.com.ng/api/voting/status');
        setVotingStatus(prev => ({
          ...prev,
          ...response.data,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error fetching voting status:', error);
        setVotingStatus(prev => ({
          ...prev,
          error: 'Failed to load voting status',
          isLoading: false
        }));
      }
    };

    fetchVotingStatus();

    // Set up WebSocket connection
    const newSocket = io('https://api.mbenefit.apel.com.ng', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('voting_status_update', (status) => {
      console.log('Received voting status update:', status);
      setVotingStatus(prev => ({
        ...prev,
        ...status,
        isLoading: false,
        error: null
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
      setVotingStatus(prev => ({
        ...prev,
        error: 'Connection error. Please refresh the page.',
        isLoading: false
      }));
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Function to update voting status (admin only)
  const updateVotingStatus = async (isOpen) => {
    try {
      setVotingStatus(prev => ({ ...prev, isLoading: true }));
      const response = await axios.post('https://api.mbenefit.apel.com.ng/api/voting/status', { isOpen });
      return response.data;
    } catch (error) {
      console.error('Error updating voting status:', error);
      throw error;
    } finally {
      setVotingStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <VotingContext.Provider value={{ votingStatus, updateVotingStatus, socket }}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

export default VotingContext;
