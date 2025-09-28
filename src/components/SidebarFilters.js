import React, { useState } from "react";
import {
  Box, Button, Checkbox, Collapse, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText, TextField, Typography, Slider
} from "@mui/material";
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export default function SidebarDrawerFilters({
                                               entryCount, setEntryCount,
                                               filterValues, onApplyFilters,
                                               menuEntries
                                             }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    Types: true,
    Roles: false,
    Festivals: false,
    Year: false,
  });
  const [searchText, setSearchText] = useState({ Types: '', Roles: '', Festivals: '' });

  const headers = ['Types', 'Roles', 'Festivals', 'Year'];
  const icons = [TheaterComedyIcon, PersonIcon, MovieIcon, CalendarMonthIcon];
  const filterArrays = {
    Types: filterValues.types,
    Roles: filterValues.roles,
    Festivals: filterValues.festivals,
    Year: filterValues.years
  };
  const filterUpdaters = {
    Types: filterValues.updateTypes,
    Roles: filterValues.updateRoles,
    Festivals: filterValues.updateFestivals,
    Year: filterValues.updateYears
  };

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const onCheckboxChange = (value, filterList, setFilterList) => {
    if (filterList.includes(value)) {
      setFilterList(filterList.filter(v => v !== value));
    } else {
      setFilterList([...filterList, value]);
    }
  };

  const onYearSliderChange = (event, newValue) => {
    filterValues.updateYears(newValue);
  };

  const onClear = (key) => {
    filterUpdaters[key]([]);
  };

  const onSearchChange = (key, value) => {
    setSearchText(prev => ({ ...prev, [key]: value.toLowerCase() }));
  };

  return (
    <>
      {!drawerOpen && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "absolute",
            top: 100,
            left: 0,
            zIndex: 1300,
            background: "#00b1bf",
            color: "#fff",
            borderRadius: "0 4px 4px 0",
            "&:hover": { bgcolor: "#00b1bf" }
          }}
        >
          <FilterAltIcon sx={{ mr: 1 }} />
          <Typography variant="body2">Filters</Typography>
        </IconButton>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{background: "#00b1bf"}}
            onClick={() => {
              onApplyFilters();
              setDrawerOpen(false);
            }}
          >
            Apply Filters
          </Button>
        </Box>

        <List>
          {headers.map((header, idx) => {
            const entries = menuEntries[header.toLowerCase()] || [];
            const filteredEntries = entries.filter(item =>
              !searchText[header] || item.name.toLowerCase().includes(searchText[header])
            );

            return (
              <Box key={header}>
                <ListItemButton onClick={() => toggleSection(header)}>
                  <ListItemIcon>{React.createElement(icons[idx])}</ListItemIcon>
                  <ListItemText primary={header} />
                  {openSections[header] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={openSections[header]} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 3, pr: 2 }}>
                    {header === 'Year' ? (
                      <>
                        <Typography variant="body2" gutterBottom>Year Range</Typography>
                        <Slider
                          value={filterValues.years}
                          onChange={onYearSliderChange}
                          valueLabelDisplay="auto"
                          min={1900}
                          max={2030}
                        />
                      </>
                    ) : (
                      <>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder={`Search ${header.toLowerCase()}`}
                          value={searchText[header]}
                          onChange={(e) => onSearchChange(header, e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Button size="small" onClick={() => onClear(header)} sx={{ mb: 1 }}>
                          Clear {header}
                        </Button>
                        {filteredEntries.slice(0, entryCount[idx]).map((item) => (
                          <ListItemButton key={item.id} sx={{ pl: 0 }} onClick={() => onCheckboxChange(item.id, filterArrays[header], filterUpdaters[header])}>
                            <Checkbox
                              size="small"
                              checked={filterArrays[header].includes(item.id)}
                            />
                            <ListItemText primary={item.name} />
                          </ListItemButton>
                        ))}
                        {filteredEntries.length > 5 && (
                          <Button
                            fullWidth
                            size="small"
                            onClick={() => {
                              setEntryCount(prev => {
                                const updated = [...prev];
                                updated[idx] = entryCount[idx] === 5 ? filteredEntries.length : 5;
                                return updated;
                              });
                            }}
                          >
                            {entryCount[idx] === 5 ? 'Show More' : 'Show Less'}
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
