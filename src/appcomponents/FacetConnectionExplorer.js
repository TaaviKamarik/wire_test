import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  Badge,
} from "@mui/material";

/**
 * FacetConnectionExplorer
 *
 * Displays connections in a clean, browsable format with two panels:
 * - Left: List of values sorted by frequency
 * - Right: When you click a value, shows what it connects with
 */
export default function FacetConnectionExplorer({
  dataUrl = "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/all_movies.json",
}) {
  const [allMovies, setAllMovies] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacet, setSelectedFacet] = useState("keywords");
  const [selectedValue, setSelectedValue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);

  // Fetch data from the URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        const moviesArray = Array.isArray(jsonData)
          ? jsonData.slice(0, 10)
          : [jsonData];
        setAllMovies(moviesArray);
        setSelectedMovieIds(moviesArray.map((m) => m.film[0]));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl]);

  // Combine selected movies and add movie hash
  useEffect(() => {
    if (allMovies.length === 0) return;
    const combinedKaadrid = [];
    selectedMovieIds.forEach((movieId) => {
      const movie = allMovies.find((m) => m.film[0] === movieId);
      if (movie) {
        const videoHash = movie.film[4]; // Get video hash from film array
        movie.kaadrid.forEach((scene) => {
          let start = 0,
            end = 0;
          if (scene.ajad && typeof scene.ajad === "string") {
            [start, end] = scene.ajad.split(" ").map(Number);
          }
          combinedKaadrid.push({ ...scene, movieId, videoHash, start, end });
        });
      }
    });
    setData({ kaadrid: combinedKaadrid });
  }, [selectedMovieIds, allMovies]);

  console.log(data);

  // Available facets to choose from
  const facetOptions = [
    { value: "actions", label: "Actions" },
    { value: "keywords", label: "Keywords" },
    { value: "persons", label: "Persons" },
    { value: "objects", label: "Objects" },
  ];

  // Build the data structure
  const explorerData = useMemo(() => {
    if (!data || !data.kaadrid) return { values: [], connections: new Map() };

    const scenes = data.kaadrid;
    const facet = selectedFacet;

    // Map to store all unique values
    const valueMap = new Map(); // value -> { count: number, scenes: [] }
    const connectionMap = new Map(); // value -> Map(otherValue -> scenes[])

    // Collect all values and their scenes
    scenes.forEach((scene, sceneIndex) => {
      let values = [];

      if (Array.isArray(scene[facet])) {
        values = scene[facet]
          .filter((v) => v && v.trim() !== "")
          .map((v) => v.toLowerCase());
      } else if (
        scene[facet] &&
        typeof scene[facet] === "string" &&
        scene[facet] !== "not clear"
      ) {
        values = [scene[facet].toLowerCase()];
      }

      values.forEach((value) => {
        if (!valueMap.has(value)) {
          valueMap.set(value, { count: 0, scenes: [] });
          connectionMap.set(value, new Map());
        }
        const entry = valueMap.get(value);
        entry.count++;
        entry.scenes.push({
          index: sceneIndex,
          snr: scene.snr,
          explanation: scene.explanation,
          ajad: scene.ajad,
        });
      });

      // Build connections
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const v1 = values[i];
          const v2 = values[j];

          const sceneData = {
            index: sceneIndex,
            snr: scene.snr,
            explanation: scene.explanation,
            ajad: scene.ajad,
          };

          // Add connection from v1 to v2
          if (!connectionMap.get(v1).has(v2)) {
            connectionMap.get(v1).set(v2, []);
          }
          connectionMap.get(v1).get(v2).push(sceneData);

          // Add connection from v2 to v1
          if (!connectionMap.get(v2).has(v1)) {
            connectionMap.get(v2).set(v1, []);
          }
          connectionMap.get(v2).get(v1).push(sceneData);
        }
      }
    });

    // Convert to sorted array
    const valuesArray = Array.from(valueMap.entries())
      .map(([value, data]) => ({
        name: value,
        count: data.count,
        scenes: data.scenes,
        connections: connectionMap.get(value),
      }))
      .sort((a, b) => b.count - a.count);

    return { values: valuesArray, connections: connectionMap };
  }, [data, selectedFacet]);

  // Filter values based on search
  const filteredValues = useMemo(() => {
    if (!searchTerm) return explorerData.values;
    const term = searchTerm.toLowerCase();
    return explorerData.values.filter((v) =>
      v.name.toLowerCase().includes(term)
    );
  }, [explorerData.values, searchTerm]);

  // Get connections for selected value
  const selectedConnections = useMemo(() => {
    if (!selectedValue) return [];

    return Array.from(selectedValue.connections.entries())
      .map(([otherValue, scenes]) => ({
        value: otherValue,
        count: scenes.length,
        scenes,
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedValue]);

  const handleValueClick = (value) => {
    setSelectedValue(value);
  };

  const handleConnectionClick = (connection) => {
    setSelectedConnection(connection);
    setModalOpen(true);
  };

  // Reset selection when facet changes
  useEffect(() => {
    setSelectedValue(null);
    setSearchTerm("");
  }, [selectedFacet]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading scene data...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Paper>
    );
  }

  if (!data || explorerData.values.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="info">No data found for the selected facet.</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Facet Connection Explorer</Typography>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Connection Type</InputLabel>
          <Select
            value={selectedFacet}
            label="Connection Type"
            onChange={(e) => setSelectedFacet(e.target.value)}
          >
            {facetOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Browse{" "}
        <strong>
          {facetOptions.find((f) => f.value === selectedFacet)?.label}
        </strong>{" "}
        values and their connections. Click a value to see what it connects
        with.
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Left Panel - List of Values */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 600, display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Values ({explorerData.values.length})
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
            </CardContent>
            <Divider />
            <List sx={{ overflow: "auto", flexGrow: 1 }}>
              {filteredValues.map((value, idx) => (
                <ListItemButton
                  key={idx}
                  selected={selectedValue?.name === value.name}
                  onClick={() => handleValueClick(value)}
                  sx={{ py: 1 }}
                >
                  <ListItemText
                    primary={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>
                          {value.name}
                        </Typography>
                      </Box>
                    }
                    secondary={`${value.connections.size} connection${
                      value.connections.size !== 1 ? "s" : ""
                    } • ${value.scenes.length} scene${
                      value.scenes.length !== 1 ? "s" : ""
                    }`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Right Panel - Connections */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600, display: "flex", flexDirection: "column" }}>
            {selectedValue ? (
              <>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Connections for:{" "}
                    <Chip label={selectedValue.name} color="primary" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Appears in {selectedValue.count} scene
                    {selectedValue.count !== 1 ? "s" : ""} •{" "}
                    {selectedConnections.length} connection
                    {selectedConnections.length !== 1 ? "s" : ""}
                  </Typography>
                </CardContent>
                <Divider />
                <List sx={{ overflow: "auto", flexGrow: 1 }}>
                  {selectedConnections.map((connection, idx) => (
                    <React.Fragment key={idx}>
                      <ListItemButton
                        onClick={() => handleConnectionClick(connection)}
                      >
                        <ListItemText
                          primary={
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="body1"
                                sx={{ flex: 1, mr: 1 }}
                              >
                                {connection.value}
                              </Typography>

                              <Chip
                                label={`${connection.count} scene${
                                  connection.count !== 1 ? "s" : ""
                                }`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItemButton>
                      {idx < selectedConnections.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                p={4}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                >
                  Select a value from the left panel to see its connections
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Modal for showing connecting scenes */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedConnection && selectedValue && (
            <>
              Scenes with both:{" "}
              <Chip label={selectedValue.name} sx={{ mx: 0.5 }} /> and{" "}
              <Chip label={selectedConnection.value} sx={{ mx: 0.5 }} />
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedConnection && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {selectedConnection.count} scene
                {selectedConnection.count !== 1 ? "s" : ""}:
              </Typography>

              {selectedConnection.scenes.map((scene, idx) => (
                <Box
                  key={idx}
                  sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" color="primary">
                    Scene {scene.snr}
                    {scene.ajad && scene.ajad.length === 2 && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({Math.floor(scene.ajad[0] / 60)}:
                        {(scene.ajad[0] % 60).toFixed(0).padStart(2, "0")} -{" "}
                        {Math.floor(scene.ajad[1] / 60)}:
                        {(scene.ajad[1] % 60).toFixed(0).padStart(2, "0")})
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                    {scene.explanation}
                  </Typography>

                  {/* Video Player */}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 600,
                      mx: "auto",
                      mt: 2,
                    }}
                  >
                    <video
                      controls
                      style={{
                        width: "100%",
                        borderRadius: "4px",
                        backgroundColor: "#000",
                      }}
                    >
                      <source
                        src={`https://cdn.efis.ee/is/EfisFilms/Video/${scene.movieId}/${scene.videoHash}#t=${scene.ajad[0]},${scene.ajad[1]}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </Box>

                  {idx < selectedConnection.scenes.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
