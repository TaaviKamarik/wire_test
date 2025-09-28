import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

function NetworkFilters(
  {
    movieData,
    genreList,
    roleList,
    selectedRoles,
    selectedGenres,
    setSelectedGenres,
    setSelectedRoles,
  }) {
  const [openDrawer, setOpenDrawer] = useState(false);


  // Memoize handlers to prevent recreating functions on every render
  const handleRoleToggle = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Memoize the filter logic

  const clearFilters =() => {
    setSelectedRoles([]);
    setSelectedGenres([]);
  }

  // Memoize the role and genre lists
  const memoizedRoleList = () => (
    <List dense>
      {roleList.map(role => (
        <ListItem key={role} dense>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
              />
            }
            label={role}
          />
        </ListItem>
      ))}
    </List>
  );
  console.log(genreList)
  console.log(roleList)

  const memoizedGenreList = () => {
    return (<List dense>
      {genreList.map(genre => (
        <ListItem key={genre} dense>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreToggle(genre)}
              />
            }
            label={genre}
          />
        </ListItem>
      ))}
    </List>)
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<FilterListIcon />}
        onClick={() => setOpenDrawer(true)}
        sx={{
          position: 'absolute',
          background: "#00b1bf",
          top: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <Box
          sx={{
            maxWidth: 300,
            padding: 2
          }}
          role="presentation"
        >
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <Divider/>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Person Roles
          </Typography>
          <Box className="filter-inner">
            <List dense>
              {roleList.map(role => (
                <ListItem key={role} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                    }
                    label={role}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider/>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Movie Genres
          </Typography>
          <Box className="filter-inner">
            <List dense>
              {genreList.map(genre => (
                <ListItem key={genre} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedGenres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                      />
                    }
                    label={genre}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider/>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Active Filters</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {selectedRoles.map(role => (
                <Chip
                  key={role}
                  label={role}
                  onDelete={() => handleRoleToggle(role)}
                />
              ))}
              {selectedGenres.map(genre => (
                <Chip
                  key={genre}
                  label={genre}
                  onDelete={() => handleGenreToggle(genre)}
                />
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
            {/*<Button
              variant="contained"
              color="primary"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>*/}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default NetworkFilters;