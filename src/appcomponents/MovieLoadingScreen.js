import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Container,
  Paper,
  Grid,
  Chip,
  Avatar,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Person } from '@mui/icons-material';
import { movieData } from '../movie_data_4';

// Styled components remain the same
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: 0,
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  height: '85vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.6s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  }
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(6),
  position: 'relative'
}));

const CastGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
  gap: theme.spacing(2),
  display: 'flex',
  flexWrap: 'wrap'
}));

// Preload utility
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

const MovieLoadingScreen = () => {
  const validMovies = movieData;
  const indexes = validMovies.length;

  const [currentMovie, setCurrentMovie] = useState(validMovies[Math.floor(Math.random() * indexes)]);
  const [isVisible, setIsVisible] = useState(true); // State for visibility

  useEffect(() => {
    if (validMovies.length === 0) return;

    const movieInterval = setInterval(async () => {
      setIsVisible(false); // Trigger fade out
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for fade-out to complete

      const nextMovie = validMovies[Math.floor(Math.random() * indexes)];
      try {
        await preloadImage(nextMovie.image); // Preload the next image
        setCurrentMovie(nextMovie); // Update the movie
        setIsVisible(true); // Trigger fade in
      } catch (error) {
        console.error("Failed to preload image:", error);
      }
    }, 7000);

    return () => {
      clearInterval(movieInterval);
    };
  }, []);


  if (!currentMovie) return null;

  return (
    <div >
        <StyledPaper elevation={6}>
          <div className={"loader-container"}><span className="loader"></span> <span className="loader-text"></span></div>
          <Fade in={isVisible} timeout={1000}>

          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} md={6}>
              <ContentContainer>
                <Box sx={{ mb: 6 }}>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    {currentMovie.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {currentMovie.year}
                  </Typography>

                  <Box sx={{ my: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Crew
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Producer:</strong> {currentMovie.producer}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Director:</strong> {currentMovie.director}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Main Cast
                  </Typography>
                  <CastGrid>
                    {currentMovie.peaosa?.map((cast, index) => (
                      <Chip
                        key={index}
                        icon={<Person />}
                        label={`${cast.actor} as ${cast.playing}`}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          padding: 1,
                          height: 'auto',
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            padding: 1
                          }
                        }}
                      />
                    ))}
                  </CastGrid>
                </Box>
              </ContentContainer>
            </Grid>
            <Grid item xs={12} md={6} sx={{ height: '100%' }}>
              <ImageContainer>
                <img
                  src={currentMovie.image}
                  alt={currentMovie.title}
                />
              </ImageContainer>
            </Grid>
          </Grid>
          </Fade>

        </StyledPaper>
    </div>
  );
};

export default MovieLoadingScreen;
