import React from 'react';
import {
  Typography, Box, Chip, Card, Modal, Grid, Divider, Avatar, Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Movie as MovieIcon
} from '@mui/icons-material';
import {getEfisImageUrl, getEfisMovieImageUrl} from "../utils/utils";

const MovieInfo = ({ movie, setSelectedNode }) => {
  const {
    title, year, types = [], festivals = [],
    actors = [], makers = [], profile_image, id
  } = movie || {};

  const handleClick = (id) => {
    setSelectedNode({ type: 'persondata', id });
  };

  const handleClose = () => setSelectedNode({type: null, id: null});

  return (
    <Modal open={!!movie} onClose={handleClose} style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <Card sx={{ maxWidth: '80%', minWidth: 1000, maxHeight: '90vh', overflowY: 'auto', p: 2 }}>
        <Box position="relative">
          <Box
            component="img"
            src={getEfisMovieImageUrl(profile_image, id) || '/replacement.jpg'}
            alt={title}
            sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1 }}
          />
          <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
            <Typography variant="h4" sx={{ color: '#fff', textShadow: '1px 1px 4px #000' }}>{title}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Chip label={`Year: ${year}`} icon={<EventIcon />} sx={{ mr: 1 }} />
          {types.map(t => (
            <Chip key={t} label={t} icon={<MovieIcon />} sx={{ mr: 1 }} />
          ))}
        </Box>

        {festivals.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3, display: "flex", alignItems: "center" }}><EventIcon sx={{ mr: 1 }} />Festivals</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {festivals.map(f => (
                <Chip key={f.id} label={f.name} variant="outlined" />
              ))}
            </Box>
          </>
        )}

        {actors.length > 0 && (
          <>
            <Typography variant="h6"sx={{ mt: 3, display: "flex", alignItems: "center" }}><PersonIcon sx={{ mr: 1 }} />Actors</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {actors.map((actor, i) => (
                <Grid item xs={6} md={4} lg={3} key={i}>
                  <Card sx={{ display: 'flex', alignItems: 'center', p: 1, cursor: 'pointer' }} onClick={() => handleClick(actor.id)}>
                    <Avatar src={getEfisImageUrl(actor.id, actor.image) || '/replacement.jpg'} alt={`${actor.first_name} ${actor.last_name}`} sx={{ mr: 2 }} />
                    <Box sx={{minHeight: "46px", display: "flex", flexDirection: "column", justifyContent: "center"}}>
                      <Typography variant="body1">{`${actor.first_name} ${actor.last_name}`}</Typography>
                      <Typography variant="caption" color="text.secondary">{actor.role ? `as ${actor.role}` : ""}</Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mt: 3, display: "flex", alignItems: "center" }}><GroupIcon sx={{ mr: 1 }} />Crew</Typography>
        {Object.entries(makers).map(([role, people]) => (
          <Box key={role} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{role}</Typography>
            <Grid container spacing={2}>
              {people.map((person, i) => (
                <Grid item xs={6} md={4} lg={3} key={i}>
                  <Tooltip title={person.name}>
                    <Card sx={{ display: 'flex', alignItems: 'center', p: 1, cursor: 'pointer' }} onClick={() => handleClick(person.id)}>
                      <Avatar src={getEfisImageUrl(person.id, person.image) || '/replacement.jpg'} alt={`${person.first_name} ${person.last_name}`} sx={{ mr: 2 }} />
                      <Typography variant="body2">{`${person.first_name} ${person.last_name}`}</Typography>
                    </Card>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Card>
    </Modal>
  );
};

export default MovieInfo;
