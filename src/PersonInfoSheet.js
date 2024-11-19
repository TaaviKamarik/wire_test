import React from 'react';
import {
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Paper,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Movie as MovieIcon,
  Work as WorkIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

const PersonInfoSheet = ({ person, setSelectedNode, setSelectedNodeType, nodes, handleNodeClick, scrollToTop }) => {
  const {
    id,
    name,
    roles,
    movies,
    links
  } = person;

  // Get unique roles across all movies
  const uniqueRoles = [...new Set(roles)];

  const handleClick = (movie) => {
    const selMovie = nodes.find(node => node.id === movie.id);
    setSelectedNode(selMovie);
    setSelectedNodeType('movie');
    handleNodeClick(selMovie);
    scrollToTop();
  };

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {name}
          </Typography>
          <Chip
            icon={<PersonIcon />}
            label={`ID: ${id}`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Primary Roles */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Primary Roles
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uniqueRoles.map((role, index) => (
              <Chip
                key={index}
                label={role}
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Filmography Section */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>
          <MovieIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filmography
        </Typography>
        <Grid container spacing={3}>
          {movies.map((movie) => (
            <Grid item xs={12} key={movie.id}>
              <Paper
                onClick={() => handleClick(movie)}
                elevation={2}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {/* Movie Poster */}
                <Box
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 200, sm: 'auto' }
                  }}
                >
                  <CardMedia
                    component="img"
                    image={movie.image || "./replacement.jpg"}
                    alt={movie.title}
                    sx={{
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>

                {/* Movie Details */}
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {movie.title}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                      label={movie.type}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Roles in this movie */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Roles in this production:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

                  {/* Genre if available */}
                  {movie.genre && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {movie.genre}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PersonInfoSheet;