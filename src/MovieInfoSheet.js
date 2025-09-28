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
  ListItemIcon, Modal, Card
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

const MovieInfoSheet = ({ movie, nodes, setSelectedNode }) => {
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
  }

  // Group crew members by role
  const crewByRole = vastutusandmed.reduce((acc, person) => {
    if (!acc[person.role]) {
      acc[person.role] = [];
    }
    acc[person.role].push(person.name);
    return acc;
  }, {});

  const handleClose = () => {
    setSelectedNode(null);
  }

  return (
    <Modal open={movie} style={{display: "flex", minWidth: "600px", justifyContent: "center", padding: "2rem"}} onClose={handleClose}>
    <Card sx={{ maxWidth: '80%', background: "white", overflowY: "scroll" }}>
      <div style={{position: 'relative', minWidth: "1200px"}}>
        <Box
          component="img"
          src={image || "./replacement.jpg"}
          alt={title}
          sx={{
            width: '100%',
            maxHeight: 600,
            objectFit: 'cover',
            borderRadius: 1
          }}
        />
        <div className="overlay">{title}</div>
        <div className={"overlay-tags"}>
          <Chip
            label={year}
            color={"primary"}
          />
          {subtype && <Chip
            label={subtype}
            color={"secondary"}
          />}
          {genre[0] !== "" && <Chip
            label={genre.join(', ')}
            color={"info"}
          />}
        </div>
      </div>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {/*<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Chip
            label={`ID: ${id}`}
            variant="outlined"
            size="small"
          />
        </Box>*/}

        {/* Basic Metadata */}
        {/*<Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Chip
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
                label={genre.join(', ')}
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>*/}
      </Box>

      <Divider sx={{}} />

      {/* Movie Image */}
     {/* <Box sx={{ mb: 4 }}>
        <Paper elevation={2}>

        </Paper>
      </Box>*/}

      {/* Cast Section */}
      {peaosa && peaosa.length > 0 && (
        <>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: "1rem"}}>
          <PersonIcon /> <span className="font-type">Cast</span>
        </Typography>
        <Box sx={{ mb: 4, display: "flex", paddingLeft: "1rem", gap: '1rem', flexWrap: "wrap" }}>
            {peaosa.map((actor, index) => (
              <Card style={{paddingLeft: "1rem", paddingRight: "1rem"}}>
                <ListItemText
                  sx={{cursor: "pointer"}}
                  onClick={() => handleClick(actor.actor)}
                  primary={<div className="font-type">{actor.actor}</div>}
                  secondary={`as ${actor.playing}`}
                />
              </Card>
            ))}
        </Box>
        </>
      )}

      <Divider />

      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: "1rem"}}>
        <GroupIcon /> <span className="font-type">Crew</span>
      </Typography>

      {Object.entries(crewByRole).map(([role, names]) => (
        <>
        <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', gap: 1, paddingLeft: "2rem"}}>
          <span className="font-type">{role}</span>
        </Typography>
        <Box sx={{mb: "1rem", display: "flex", paddingLeft: "2rem", gap: '1rem', flexWrap: "wrap"}}>
          {names.map((actor, index) => (
            <Card style={{paddingLeft: "1rem", paddingRight: "1rem"}}>
              <ListItemText
                sx={{cursor: "pointer"}}
                onClick={() => handleClick(actor)}
                primary={<div className="font-type">{actor}</div>}
              />
            </Card>
          ))}
    </Box></>))}

      {/* Crew Section */}
      {/*<Box>
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
      </Box>*/}
    </Card>
    </Modal>
  );
};

export default MovieInfoSheet;