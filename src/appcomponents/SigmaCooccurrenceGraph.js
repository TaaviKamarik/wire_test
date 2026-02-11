import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import {
  SigmaContainer,
  useRegisterEvents,
  useLoadGraph,
  useSigma,
} from "@react-sigma/core";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";

// Event handler component
function GraphEvents({ onNodeClick, onEdgeClick }) {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        const node = sigma.getGraph().getNodeAttributes(event.node);
        onNodeClick({ ...node, id: event.node });
      },
      clickEdge: (event) => {
        const graph = sigma.getGraph();
        const edge = graph.getEdgeAttributes(event.edge);
        const sourceNode = graph.getNodeAttributes(graph.source(event.edge));
        const targetNode = graph.getNodeAttributes(graph.target(event.edge));
        onEdgeClick({
          ...edge,
          id: event.edge,
          sourceLabel: sourceNode.label,
          targetLabel: targetNode.label,
        });
      },
    });
  }, [registerEvents, sigma, onNodeClick, onEdgeClick]);

  return null;
}

// Graph loader component
function LoadGraph({ graphData }) {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Generate colors for nodes
    const colorPalette = [
      "#e74c3c",
      "#3498db",
      "#2ecc71",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#e67e22",
      "#34495e",
      "#16a085",
      "#c0392b",
      "#27ae60",
      "#2980b9",
      "#8e44ad",
      "#d35400",
      "#c0392b",
    ];

    // Add nodes
    graphData.nodes.forEach((node, idx) => {
      graph.addNode(node.id, {
        label: node.name,
        size: 3 + Math.log(node.count + 1) * 2,
        color: node.nodeColor || colorPalette[idx % colorPalette.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        scenes: node.scenes,
        count: node.count,
        movieIds: node.movieIds,
      });
    });

    // Add edges
    graphData.links.forEach((link, idx) => {
      try {
        graph.addEdge(link.source, link.target, {
          size: 1,
          scenes: link.scenes,
          value: link.value,
          color: "#999",
        });
      } catch (e) {
        console.warn("Could not add edge:", link, e);
      }
    });

    // Apply force layout
    const settings = forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        gravity: 1,
        scalingRatio: 10,
        slowDown: 1,
        barnesHutOptimize: true,
        barnesHutTheta: 0.5,
      },
    });

    loadGraph(graph);
  }, [loadGraph, graphData]);

  return null;
}

export default function SigmaCooccurrenceGraph({
  dataUrl = "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/all_movies.json",
}) {
  const [allMovies, setAllMovies] = useState([]); // Array of all movie objects
  const [scenes, setScenes] = useState([]); // Scenes for selected movie(s)
  const [loading, setLoading] = useState(true);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]); // Can select multiple movies
  const [searchTerm, setSearchTerm] = useState("");

  // Parameters
  const [selectedFacet, setSelectedFacet] = useState("keywords");
  const [minCooccurrence, setMinCooccurrence] = useState(2);

  // Fixed graph physics parameters
  const maxNodes = 999999;

  // Modals
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeScenes, setSelectedNodeScenes] = useState([]);
  const [nodeConnections, setNodeConnections] = useState([]);

  // Fetch combined movie data
  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.json())
      .then((data) => {
        // Expect array of movie objects: [{ film: [...], kaadrid: [...] }, ...]
        const moviesArray = Array.isArray(data) ? data.slice(0, 10) : [data];
        setAllMovies(moviesArray);

        // Auto-select all movies by default
        setSelectedMovieIds(moviesArray.map((m) => m.film[0]));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading movie data:", err);
        setAllMovies([]);
        setLoading(false);
      });
  }, [dataUrl]);

  // Update scenes when selected movies change
  useEffect(() => {
    let combinedScenes = [];
    selectedMovieIds.forEach((movieId) => {
      const movie = allMovies.find((m) => m.film[0] === movieId);
      if (movie) {
        const videoHash = movie.film[4];
        movie.kaadrid.forEach((scene) => {
          let start = 0,
            end = 0;
          if (scene.ajad && typeof scene.ajad === "string") {
            [start, end] = scene.ajad.split(" ").map(Number);
          }
          combinedScenes.push({ ...scene, movieId, videoHash, start, end });
        });
      }
    });
    setScenes(combinedScenes);
  }, [selectedMovieIds, allMovies]);

  // Movie selector handler
  const handleMovieSelection = (movieId) => {
    setSelectedMovieIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Filtered movie list based on search
  const filteredMovies = useMemo(() => {
    if (!searchTerm) return allMovies;
    const term = searchTerm.toLowerCase();
    return allMovies.filter(
      (movie) =>
        movie.film[3]?.toLowerCase().includes(term) ||
        movie.film[0]?.toString().includes(term)
    );
  }, [allMovies, searchTerm]);

  // Build co-occurrence graph data
  const graphData = useMemo(() => {
    if (scenes.length === 0) {
      return { nodes: [], links: [] };
    }

    const valueCounts = new Map();
    const scenesByValue = new Map();

    scenes.forEach((scene, sceneIdx) => {
      const facetData = scene[selectedFacet];
      let values = [];

      if (Array.isArray(facetData)) {
        values = facetData.map((v) => String(v).toLowerCase());
      } else if (facetData) {
        values = [String(facetData).toLowerCase()];
      }

      values.forEach((value) => {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        if (!scenesByValue.has(value)) {
          scenesByValue.set(value, []);
        }
        scenesByValue.get(value).push({ scene, sceneIdx });
      });
    });

    const topValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNodes)
      .map(([value]) => value);

    // Create movie color map
    const movieColors = new Map();
    const movieColorPalette = [
      "#e74c3c",
      "#3498db",
      "#2ecc71",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#e67e22",
      "#34495e",
    ];
    selectedMovieIds.forEach((movieId, idx) => {
      movieColors.set(
        movieId,
        movieColorPalette[idx % movieColorPalette.length]
      );
    });

    // Determine node color based on which movies have this value
    const nodes = topValues.map((value) => {
      const movieIdsWithValue = new Set(
        scenesByValue.get(value).map((s) => s.scene.movieId)
      );
      // If multiple movies, use a mixed color. If single, use that movie's color
      let nodeColor = "#999";
      if (movieIdsWithValue.size === 1) {
        nodeColor = movieColors.get(Array.from(movieIdsWithValue)[0]) || "#999";
      } else {
        // Multi-movie: use purple for distinction
        nodeColor = "#9b59b6";
      }

      return {
        id: value,
        name: value,
        count: valueCounts.get(value),
        scenes: scenesByValue.get(value),
        movieIds: Array.from(movieIdsWithValue),
        nodeColor,
      };
    });

    const links = [];
    const linkMap = new Map();

    scenes.forEach((scene, sceneIdx) => {
      const facetData = scene[selectedFacet];
      let values = [];

      if (Array.isArray(facetData)) {
        values = facetData
          .map((v) => String(v).toLowerCase())
          .filter((v) => topValues.includes(v));
      } else if (
        facetData &&
        topValues.includes(String(facetData).toLowerCase())
      ) {
        values = [String(facetData).toLowerCase()];
      }

      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const source = values[i];
          const target = values[j];
          const linkKey = [source, target].sort().join("|||");

          if (!linkMap.has(linkKey)) {
            linkMap.set(linkKey, {
              source,
              target,
              scenes: [],
              value: 0,
            });
          }

          linkMap.get(linkKey).scenes.push({ scene, sceneIdx });
          linkMap.get(linkKey).value += 1;
        }
      }
    });

    Array.from(linkMap.values()).forEach((link) => {
      if (link.value >= minCooccurrence) {
        links.push(link);
      }
    });

    return { nodes, links };
  }, [scenes, selectedFacet, minCooccurrence, maxNodes]);

  const handleNodeClick = useCallback(
    (node) => {
      console.log("✅ Node clicked:", node.label);
      if (node && node.id) {
        setSelectedNode(node);
        // Find all connections for this node
        const connections = graphData.links
          .filter((link) => link.source === node.id || link.target === node.id)
          .map((link) => ({
            partnerId: link.source === node.id ? link.target : link.source,
            partnerName: link.source === node.id ? link.target : link.source,
            sceneCount: link.scenes.length,
            scenes: link.scenes,
          }));
        setNodeConnections(connections);
        setNodeModalOpen(true);
      }
    },
    [graphData.links]
  );

  const handleConnectionClick = useCallback((connection) => {
    setSelectedNodeScenes(connection.scenes);
    setNodeModalOpen(false);
    setConnectionModalOpen(true);
  }, []);

  const handleEdgeClick = useCallback((edge) => {
    console.log("✅ Edge clicked:", edge);
    if (edge && edge.scenes && edge.scenes.length > 0) {
      setSelectedNode({
        label: `${edge.sourceLabel} + ${edge.targetLabel}`,
      });
      setSelectedNodeScenes(edge.scenes);
      setNodeModalOpen(true);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Loading graph data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, mb: 2 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Co-occurrence Network (Sigma.js)
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Movie Selector */}
            {allMovies.length > 1 && (
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}
                >
                  <Typography variant="subtitle2">
                    Movies ({selectedMovieIds.length}/{allMovies.length}{" "}
                    selected):
                  </Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      setSelectedMovieIds(allMovies.map((m) => m.film[0]))
                    }
                  >
                    Select All
                  </Button>
                  <Button size="small" onClick={() => setSelectedMovieIds([])}>
                    Clear All
                  </Button>
                  <TextField
                    size="small"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ ml: "auto", width: 250 }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    maxHeight: 200,
                    overflowY: "auto",
                    p: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 1,
                  }}
                >
                  {filteredMovies.map((movie) => (
                    <Chip
                      key={movie.film[0]}
                      label={movie.film[3] || `Movie ${movie.film[0]}`}
                      onClick={() => handleMovieSelection(movie.film[0])}
                      variant={
                        selectedMovieIds.includes(movie.film[0])
                          ? "filled"
                          : "outlined"
                      }
                      color={
                        selectedMovieIds.includes(movie.film[0])
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Facet Type</InputLabel>
                <Select
                  value={selectedFacet}
                  label="Facet Type"
                  onChange={(e) => setSelectedFacet(e.target.value)}
                >
                  <MenuItem value="keywords">Keywords</MenuItem>
                  <MenuItem value="actions">Actions</MenuItem>
                  <MenuItem value="persons">Persons</MenuItem>
                  <MenuItem value="objects">Objects</MenuItem>
                  <MenuItem value="placement">Placement</MenuItem>
                  <MenuItem value="daytime">Daytime</MenuItem>
                  <MenuItem value="shot_type">Shot Type</MenuItem>
                  <MenuItem value="season">Season</MenuItem>
                  <MenuItem value="imagetype">Image Type</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom variant="body2">
                Min Co-occurrence: {minCooccurrence}
              </Typography>
              <Slider
                value={minCooccurrence}
                onChange={(e, val) => setMinCooccurrence(val)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Chip
              label={`${graphData.nodes.length} nodes`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${graphData.links.length} links`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Graph */}
      <Paper sx={{ p: 2, height: 700, width: "100%" }} elevation={3}>
        {graphData.nodes.length > 0 ? (
          <SigmaContainer
            style={{ height: "650px", width: "100%" }}
            settings={{
              renderLabels: true,
              labelRenderedSizeThreshold: 0,
              defaultNodeColor: "#999",
              defaultEdgeColor: "#ccc",
              labelFont: "Arial",
              labelSize: 12,
              enableEdgeClickEvents: true,
              enableEdgeHoverEvents: true,
            }}
          >
            <LoadGraph graphData={graphData} />
            <GraphEvents
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            />
          </SigmaContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 650,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {loading
                ? "Loading data..."
                : "No data available. Try adjusting parameters or selecting a different facet."}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Node Modal - Shows all connections */}
      <Dialog
        open={nodeModalOpen}
        onClose={() => setNodeModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Connections for: {selectedNode?.label} ({nodeConnections.length}{" "}
          connections)
        </DialogTitle>
        <DialogContent>
          {nodeConnections.map((connection, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 1,
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "grey.100" },
              }}
              onClick={() => handleConnectionClick(connection)}
            >
              <Typography variant="h6" color="primary">
                {connection.partnerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {connection.sceneCount} scene
                {connection.sceneCount !== 1 ? "s" : ""} - Click to view
              </Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Connection Modal - Shows scenes for selected connection */}
      <Dialog
        open={connectionModalOpen}
        onClose={() => {
          setConnectionModalOpen(false);
          setNodeModalOpen(true);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNode?.label} +{" "}
          {selectedNodeScenes[0]?.scene ? "Connection" : ""} (
          {selectedNodeScenes.length} scenes)
        </DialogTitle>
        <DialogContent>
          {selectedNodeScenes.map(({ scene, sceneIdx }, idx) => (
            <Box
              key={sceneIdx}
              sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
            >
              <Typography variant="subtitle2" color="primary">
                Scene {scene.snr || sceneIdx + 1}
                {scene.start && scene.end && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({Math.floor(scene.start / 60)}:
                    {(scene.start % 60).toFixed(0).padStart(2, "0")} -{" "}
                    {Math.floor(scene.end / 60)}:
                    {(scene.end % 60).toFixed(0).padStart(2, "0")})
                  </Typography>
                )}
              </Typography>
              {scene.explanation && (
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                  {scene.explanation}
                </Typography>
              )}

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
                    src={`https://cdn.efis.ee/is/EfisFilms/Video/${scene.movieId}/${scene.videoHash}#t=${scene.start},${scene.end}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </Box>

              {idx < selectedNodeScenes.length - 1 && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
