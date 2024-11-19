import React, { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Fade, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: '500',
  marginTop: theme.spacing(2),
  color: '#2196F3',
  textAlign: 'center',
  letterSpacing: '0.5px',
}));

const LoadingScreen = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress (for demonstration purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((oldProgress) => {
        const newProgress = oldProgress + 0.4;
        if (newProgress >= 100) clearInterval(interval);
        return newProgress;
      });
    }, 50); // Adjust speed of progress bar updates

    return () => clearInterval(interval);
  }, []);

  return (
    <LoadingContainer>
      <CircularProgress size={80} thickness={4} color="primary" />
      <LoadingText variant="h6">
        Simulating node graph
      </LoadingText>
      <LinearProgress
        variant="determinate"
        value={loadingProgress}
        sx={{
          width: '80%',
          height: 10,
          marginTop: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          '& .MuiLinearProgress-bar': {
            backgroundImage: 'linear-gradient(90deg, #2196F3, #1976D2)',
          },
        }}
      />
    </LoadingContainer>
  );
};

export default LoadingScreen;
