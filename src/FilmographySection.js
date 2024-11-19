import React from 'react';
import {
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Movie as MovieIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

const FilmographySection = ({ movies }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <MovieIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Filmography
      </Typography>

      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} md={6} key={movie.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Movie Poster */}
              <CardMedia
                component="img"
                height="300"
                image={movie.image || "/api/placeholder/400/300"}
                alt={movie.title}
                sx={{
                  objectFit: 'cover',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              />

              {/* Movie Details */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom component="h3">
                  {movie.title}
                </Typography>

                {/* Primary Movie Info */}
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  mb: 2,
                  '& .MuiChip-root': {
                    borderRadius: 1
                  }
                }}>
                  <Chip
                    icon={<CalendarIcon />}
                    label={movie.year}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LanguageIcon />}
                    label={movie.language}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TagIcon />}
                    label={movie.subtype}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Roles Section */}
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Roles:
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    '& .MuiChip-root': {
                      borderRadius: 1
                    }
                  }}>
                    {movie.roles.map((role, index) => (
                      <Chip
                        key={index}
                        label={role}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>

              {/* Genre Footer */}
              {movie.genre && (
                <CardActions sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  px: 2,
                  py: 1.5
                }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    {movie.genre}
                  </Typography>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FilmographySection;