import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
} from "@mui/material";
import { ResponsiveSankey } from "@nivo/sankey";

/**
 * FacetTransitionSankey
 *
 * Flow diagram showing how scenes transition between facet values.
 * Reveals structural patterns like how often "outdoor day" scenes
 * are followed by "indoor night" scenes.
 */
export default function FacetTransitionSankey({
  dataUrl = "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/all_movies.json",
}) {
  const [allMovies, setAllMovies] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacet, setSelectedFacet] = useState("placement");
  const [minTransitions, setMinTransitions] = useState(2);
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
        const videoHash = movie.film[4];
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

  // Available facets
  const facetOptions = [
    { value: "shot_type", label: "Shot Type" },
    { value: "placement", label: "Placement" },
    { value: "imagetype", label: "Image Type" },
    { value: "season", label: "Season" },
    { value: "daytime", label: "Daytime" },
  ];

  // Build Sankey data
  const sankeyData = useMemo(() => {
    if (!data || !data.kaadrid) return null;

    const scenes = data.kaadrid;
    const facet = selectedFacet;

    // Count transitions
    const transitionMap = new Map();
    const nodeSet = new Set();

    for (let i = 0; i < scenes.length - 1; i++) {
      const currentScene = scenes[i];
      const nextScene = scenes[i + 1];

      let currentValue = currentScene[facet];
      let nextValue = nextScene[facet];

      // Skip if values are not clear or missing
      if (
        !currentValue ||
        !nextValue ||
        currentValue === "not clear" ||
        nextValue === "not clear"
      ) {
        continue;
      }

      // For array facets, take first value
      if (Array.isArray(currentValue)) {
        currentValue = currentValue[0];
      }
      if (Array.isArray(nextValue)) {
        nextValue = nextValue[0];
      }

      if (!currentValue || !nextValue) continue;

      // Skip self-loops (same value → same value) to prevent circular links
      if (currentValue === nextValue) continue;

      // Create transition key
      const key = `${currentValue}|||${nextValue}`;

      // Add to node set
      nodeSet.add(currentValue);
      nodeSet.add(nextValue);

      // Count transition
      if (!transitionMap.has(key)) {
        transitionMap.set(key, 0);
      }
      transitionMap.set(key, transitionMap.get(key) + 1);
    }

    // Build nodes
    const nodes = Array.from(nodeSet).map((name) => ({
      id: name,
    }));

    // Build initial links from transitions
    const allLinks = [];
    transitionMap.forEach((count, key) => {
      if (count >= minTransitions) {
        const [source, target] = key.split("|||");
        allLinks.push({ source, target, value: count });
      }
    });

    // Break cycles by removing weakest links in cycles
    // This uses a greedy approach: sort links by value and add them one by one
    // only if they don't create a cycle
    const links = [];
    const graph = new Map(); // adjacency list for cycle detection

    // Helper: check if adding edge would create a cycle using DFS
    const wouldCreateCycle = (from, to) => {
      if (from === to) return true;

      const visited = new Set();
      const stack = [to];

      while (stack.length > 0) {
        const current = stack.pop();
        if (current === from) return true;
        if (visited.has(current)) continue;

        visited.add(current);
        const neighbors = graph.get(current) || [];
        stack.push(...neighbors);
      }

      return false;
    };

    // Sort links by value (strongest first) to prioritize important transitions
    allLinks.sort((a, b) => b.value - a.value);

    // Add links one by one, skipping those that create cycles
    for (const link of allLinks) {
      if (!wouldCreateCycle(link.source, link.target)) {
        links.push(link);

        // Update graph
        if (!graph.has(link.source)) {
          graph.set(link.source, []);
        }
        graph.get(link.source).push(link.target);
      }
    }

    // Filter out nodes that have no links
    const linkedNodeIds = new Set();
    links.forEach((link) => {
      linkedNodeIds.add(link.source);
      linkedNodeIds.add(link.target);
    });

    const filteredNodes = nodes.filter((node) => linkedNodeIds.has(node.id));

    if (filteredNodes.length === 0 || links.length === 0) {
      return null;
    }

    return {
      nodes: filteredNodes,
      links,
    };
  }, [data, selectedFacet, minTransitions]);

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

  if (!data) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="info">No data available.</Alert>
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
        <Typography variant="h5">Scene Transition Flow</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Shows directional flow between {selectedFacet.replace("_", " ")} values
        across consecutive scenes. Thicker flows = more frequent transitions.
        Cycles are automatically removed to show the dominant flow patterns,
        prioritizing the strongest transitions.
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Facet</InputLabel>
            <Select
              value={selectedFacet}
              label="Facet"
              onChange={(e) => setSelectedFacet(e.target.value)}
            >
              {facetOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="caption" gutterBottom display="block">
            Minimum transitions to show: {minTransitions}
          </Typography>
          <Slider
            value={minTransitions}
            onChange={(e, val) => setMinTransitions(val)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Higher = only show frequent transitions
          </Typography>
        </Grid>
      </Grid>

      {/* Sankey Diagram */}
      {sankeyData && sankeyData.nodes.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            height: 600,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            bgcolor: "white",
          }}
        >
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 40, right: 160, bottom: 40, left: 160 }}
            align="justify"
            colors={{ scheme: "category10" }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{
              from: "color",
              modifiers: [["darker", 0.8]],
            }}
            nodeBorderRadius={3}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1]],
            }}
            legends={[]}
            tooltip={({ node, link }) => {
              if (link) {
                return (
                  <Box
                    sx={{
                      background: "white",
                      padding: "9px 12px",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{link.source.id}</strong> →{" "}
                      <strong>{link.target.id}</strong>
                    </Typography>
                    <Typography variant="caption">
                      {link.value} transition{link.value !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                );
              }
              if (node) {
                return (
                  <Box
                    sx={{
                      background: "white",
                      padding: "9px 12px",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{node.id}</strong>
                    </Typography>
                    <Typography variant="caption">
                      {node.value} transition{node.value !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                );
              }
              return null;
            }}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No transitions found with current settings. Try lowering the minimum
          transition threshold or selecting a different facet.
        </Alert>
      )}

      {sankeyData && sankeyData.nodes.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {sankeyData.nodes.length} unique values • {sankeyData.links.length}{" "}
            transitions shown
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
