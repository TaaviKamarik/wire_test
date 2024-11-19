import React, {useRef} from 'react';
import {
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Movie as MovieIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  LocalOffer as TagIcon,
  Label as LabelIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const MovieInfoSheet = ({ movie, nodes, setSelectedNode, setSelectedNodeType, handleNodeClick, scrollToTop }) => {
  const {
    title,
    type,
    subtype,
    year,
    language,
    image,
    peaosa,
    vastutusandmed,
    genre,
    id,
  } = movie;

  const handleClick = (person) => {
    const selPerson = nodes.find(node => node.id === person);
    setSelectedNode(selPerson);
    setSelectedNodeType('person');
    handleNodeClick(selPerson);
    scrollToTop()
  }

  // Group crew members by role
  const crewByRole = vastutusandmed.reduce((acc, person) => {
    if (!acc[person.role]) {
      acc[person.role] = [];
    }
    acc[person.role].push(person.name);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Chip
            label={`ID: ${id}`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Basic Metadata */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Chip
              icon={<CalendarIcon />}
              label={year}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<LanguageIcon />}
              label={language}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<MovieIcon />}
              label={type}
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<TagIcon />}
              label={subtype}
              variant="outlined"
            />
          </Grid>
          {genre && (
            <Grid item>
              <Chip
                icon={<LabelIcon />}
                label={genre.replaceAll('Žanr:', ',')}
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Movie Image */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={2}>
          <Box
            component="img"
            src={image || "./replacement.jpg"}
            alt={title}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 1
            }}
          />
        </Paper>
      </Box>

      {/* Cast Section */}
      {peaosa && peaosa.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon /> Cast
          </Typography>
          <List>
            {peaosa.map((actor, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{cursor: "pointer"}}
                  onClick={() => handleClick(actor.actor)}
                  primary={actor.actor}
                  secondary={`as ${actor.playing}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* Crew Section */}
      <Box>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GroupIcon /> Crew
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(crewByRole).map(([role, names]) => (
            <Grid item xs={12} sm={6} key={role}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {role}
                </Typography>
                <List dense>
                  {names.map((name, index) => (
                    <ListItem key={index}>
                      <ListItemText sx={{cursor: "pointer"}} primary={name} onClick={() => handleClick(name)} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MovieInfoSheet;