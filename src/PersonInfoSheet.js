import React from 'react';
import {
  Box,
  Chip,
  Divider,
  Paper,
  Card,
  CardMedia,
  Modal, Typography,
} from '@mui/material';
import {
  Movie as MovieIcon
} from '@mui/icons-material';
import {getEfisImageUrl, getEfisMovieImageUrl} from "./utils/utils";
import replacementImg from "./files/replacement.jpg";

const PersonInfoSheet = ({ person, setSelectedNode }) => {
  const {
    id,
    name,
    roles,
    movies,
    image
  } = person;

  const uniqueRoles = [...new Set(roles)];

  const handleClick = (movie) => {
    setSelectedNode({ type: "moviedata", id: movie.id });
  };

  const handleClose = () => {
    setSelectedNode({ type: null, id: null });
  };

  return (
    <Modal open={person} style={{ display: "flex", justifyContent: "center", padding: "2rem" }} onClose={handleClose}>
      <Card sx={{ p: 3, maxWidth: '80%', background: "white", overflowY: "scroll" }}>
        {/* Header Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {image && (
              <CardMedia
                component="img"
                image={getEfisImageUrl(id, image) || replacementImg}
                alt={name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = replacementImg;
                }}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid #ccc'
                }}
              />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h2" className="font-type">{name}</Typography>
              {/*<Chip label={`ID: ${id}`} variant="outlined" size="small" />*/}
            </Box>
          </Box>

          {/* Primary Roles */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {uniqueRoles.map((role, index) => (
                <Chip className="font-type" key={index} label={role} color="primary" />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Filmography Section */}
        <Box>
          <div style={{ display: 'flex', gap: "1rem", alignItems: "center", paddingTop: "1rem", paddingBottom: "1rem" }}>
            <MovieIcon />
            <div className="font-type" style={{ fontSize: "1.5rem" }}>Filmography</div>
          </div>

          <div style={{
            columnCount: 2,
            columnGap: '1rem',
          }}>
            {movies.map((movie) => (
              <div key={movie.id} style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
                <Paper
                  onClick={() => handleClick(movie)}
                  elevation={3}
                  sx={{
                    display: 'flex',
                    flexDirection: "column",
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                >
                  {/* Movie Poster */}
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={getEfisMovieImageUrl(movie.image, movie.id)}
                      alt={movie.title}
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite loop if fallback fails
                        e.target.src = replacementImg;
                      }}
                      sx={{
                        height: 300,
                        width: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box className="overlay-tags" sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={movie.year} size="small" color="primary" />
                      {movie.subtype && <Chip label={movie.subtype} size="small" color="secondary" />}
                    </Box>
                  </Box>

                  {/* Movie Details */}
                  <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="h6" className="font-type">{movie.title}</Typography>

                    {/* Maker Roles */}
                    {movie.maker_roles?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Crew Roles</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {movie.maker_roles.map((role, i) => (
                            <Chip key={`maker-${i}`} label={role} size="small" variant="outlined" color="success" />
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Actor Roles */}
                    {movie.actor_roles?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Actor Roles</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {movie.actor_roles.map((role, i) => (
                            <Chip key={`actor-${i}`} label={role} size="small" variant="outlined" color="warning" />
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Movie Types */}
                    {movie.types?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Categories</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {movie.types.map((type, i) => (
                            <Chip key={`type-${i}`} label={type} size="small" variant="outlined" color="info" />
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Festivals */}
                    {movie.festivals?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Festivals</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
                          {movie.festivals.slice(0, 5).map((fest, i) => (
                            <Chip
                              key={`festival-${i}`}
                              label={fest.name}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          ))}
                          {movie.festivals.length > 5 && (
                            <Chip
                              label={`+${movie.festivals.length - 5} more`}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          )}
                        </Box>
                      </>
                    )}
                  </Box>

                </Paper>
              </div>

            ))}
          </div>
        </Box>
      </Card>
    </Modal>
  );
};

export default PersonInfoSheet;
