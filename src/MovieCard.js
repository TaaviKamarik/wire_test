import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Stack
} from '@mui/material';
import {
  Movie as MovieIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

const MovieCard = ({ movie }) => {
  const {
    title,
    type,
    subtype,
    year,
    language,
    image,
    peaosa,
    vastutusandmed
  } = movie;

  // Get directors from vastutusandmed
  const directors = vastutusandmed
    .filter(person => person.role === 'Režissöör')
    .map(director => director.name);

  return (
    <Card
      sx={{
        maxWidth: 345,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="194"
          image={image || "/api/placeholder/400/225"}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />

        {/* Type badge overlay */}
        <Chip
          label={type}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
            }
          }}
        />
      </Box>

      <CardContent>
        {/* Title and Year */}
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {title}
        </Typography>

        <Stack spacing={2}>
          {/* Year */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {year}
            </Typography>
          </Box>

          {/* Subtype and Language */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={subtype}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<LanguageIcon />}
              label={language}
              size="small"
              variant="outlined"
            />
          </Stack>

          {/* Directors */}
          {directors.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <MovieIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                {directors.join(', ')}
              </Typography>
            </Box>
          )}

          {/* Main Actor */}
          {peaosa?.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                {peaosa[0].actor} as {peaosa[0].playing}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MovieCard;