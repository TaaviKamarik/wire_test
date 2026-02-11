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
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { ResponsiveBump } from "@nivo/bump";

/**
 * TemporalFlowGraph
 *
 * Shows how facet values evolve over the film's timeline.
 * Visualizes shifts from outdoor→indoor, day→night, etc. with smooth transitions.
 * Uses a bump chart (stream graph) to show the prevalence of different values over time.
 */
export default function TemporalFlowGraph({
  dataUrl = "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/all_movies.json",
}) {
  const [allMovies, setAllMovies] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacet, setSelectedFacet] = useState("placement");
  const [timeSegments, setTimeSegments] = useState(20);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);

  // Fetch data
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

  // Get total scene count for "All Scenes" option
  const totalSceneCount = data?.kaadrid?.length || 0;

  // Available facets with good temporal visualization
  const facetOptions = [
    { value: "placement", label: "Placement (Indoor/Outdoor)" },
    { value: "daytime", label: "Daytime" },
    { value: "shot_type", label: "Shot Type" },
    { value: "imagetype", label: "Image Type" },
    { value: "season", label: "Season" },
  ];

  // Build temporal flow data
  const { bumpData, totalScenes, valueColors } = useMemo(() => {
    if (!data || !data.kaadrid) {
      return { bumpData: [], totalScenes: 0, valueColors: {} };
    }

    const scenes = data.kaadrid;
    const facet = selectedFacet;

    // Get all unique values for this facet
    const allValues = new Set();
    scenes.forEach((scene) => {
      const val = scene[facet];
      if (val && val !== "not clear") {
        if (Array.isArray(val)) {
          val.forEach((v) => allValues.add(v.toLowerCase()));
        } else {
          allValues.add(val.toLowerCase());
        }
      }
    });

    // Divide timeline into segments
    const totalSceneCount = scenes.length;
    const segmentSize = Math.ceil(totalSceneCount / timeSegments);

    // Count value occurrences in each segment
    const valueData = new Map();
    allValues.forEach((value) => {
      valueData.set(value, Array(timeSegments).fill(0));
    });

    scenes.forEach((scene, index) => {
      const segmentIndex = Math.floor(index / segmentSize);
      if (segmentIndex >= timeSegments) return; // Safety check

      const val = scene[facet];
      if (!val || val === "not clear") return;

      if (Array.isArray(val)) {
        val.forEach((v) => {
          const key = v.toLowerCase();
          if (valueData.has(key)) {
            valueData.get(key)[segmentIndex]++;
          }
        });
      } else {
        const key = val.toLowerCase();
        if (valueData.has(key)) {
          valueData.get(key)[segmentIndex]++;
        }
      }
    });

    // Convert to Nivo bump chart format
    const bumpChartData = Array.from(valueData.entries()).map(
      ([value, counts]) => ({
        id: value,
        data: counts.map((count, index) => ({
          x: index + 1,
          y: count,
        })),
      })
    );

    // Sort by total occurrences (descending) and take top values
    const sortedData = bumpChartData
      .map((series) => ({
        ...series,
        total: series.data.reduce((sum, d) => sum + d.y, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8) // Show top 8 values
      .map(({ id, data }) => ({ id, data }));

    // Assign colors based on facet type
    const colors = {};
    const colorSchemes = {
      placement: {
        outdoor: "#4caf50",
        indoor: "#2196f3",
        "semi-outdoor": "#ff9800",
      },
      daytime: {
        day: "#ffd54f",
        night: "#3f51b5",
        dusk: "#ff6f00",
        dawn: "#f48fb1",
      },
      shot_type: {
        "close-up": "#e91e63",
        medium: "#9c27b0",
        long: "#3f51b5",
        "extreme close-up": "#f44336",
      },
      imagetype: {
        graafika: "#9c27b0",
        film: "#2196f3",
        foto: "#4caf50",
      },
      season: {
        summer: "#ff9800",
        winter: "#2196f3",
        spring: "#4caf50",
        autumn: "#ff5722",
      },
    };

    const schemeColors = colorSchemes[facet] || {};
    sortedData.forEach((series) => {
      colors[series.id] = schemeColors[series.id] || undefined;
    });

    return {
      bumpData: sortedData,
      totalScenes: totalSceneCount,
      valueColors: colors,
    };
  }, [data, selectedFacet, timeSegments]);

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
      <Typography variant="h5" gutterBottom>
        Temporal Flow Graph
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Shows how {selectedFacet.replace("_", " ")} values evolve throughout the
        film. Thicker bands = more prevalent at that point in the timeline.
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
          <Typography variant="caption" display="block" gutterBottom>
            Timeline Resolution:
          </Typography>
          <ToggleButtonGroup
            value={timeSegments}
            exclusive
            onChange={(e, val) => val && setTimeSegments(val)}
            size="small"
          >
            <ToggleButton value={10}>Coarse (10)</ToggleButton>
            <ToggleButton value={20}>Medium (20)</ToggleButton>
            <ToggleButton value={30}>Fine (30)</ToggleButton>
            <ToggleButton value={totalSceneCount}>All Scenes</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" display="block">
            Higher resolution shows more detailed temporal changes
          </Typography>
        </Grid>
      </Grid>

      {/* Bump Chart */}
      {bumpData.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            height: 500,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            bgcolor: "white",
          }}
        >
          <ResponsiveBump
            data={bumpData}
            colors={(series) =>
              valueColors[series.id] || { scheme: "spectral" }
            }
            lineWidth={3}
            activeLineWidth={6}
            inactiveLineWidth={3}
            inactiveOpacity={0.15}
            pointSize={10}
            activePointSize={16}
            inactivePointSize={0}
            pointColor={{ theme: "background" }}
            pointBorderWidth={3}
            activePointBorderWidth={3}
            pointBorderColor={{ from: "serie.color" }}
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendPosition: "middle",
              legendOffset: -36,
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Timeline Segment",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Rank",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            margin={{ top: 40, right: 40, bottom: 40, left: 60 }}
            axisRight={null}
            enableGridX={true}
            enableGridY={false}
            legends={[]}
            startLabel={false}
            endLabel={false}
            tooltip={({ serie }) => (
              <Box
                sx={{
                  background: "white",
                  padding: "9px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  <strong style={{ color: valueColors[serie.id] }}>
                    {serie.id}
                  </strong>
                </Typography>
              </Box>
            )}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No temporal flow data available for the selected facet.
        </Alert>
      )}

      {/* Summary Statistics */}
      {bumpData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Timeline Overview:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total scenes: <strong>{totalScenes}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Segments: <strong>{timeSegments}</strong> (≈
                {Math.ceil(totalScenes / timeSegments)} scenes each)
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              Tracked values:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {bumpData.map((series) => (
                <Chip
                  key={series.id}
                  label={series.id}
                  size="small"
                  sx={{
                    bgcolor: valueColors[series.id] || "#9e9e9e",
                    color: "white",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>How to read:</strong> Each colored line represents a facet
          value. Lines that rise toward the top are more prevalent in that
          segment. Watch for crossovers to see shifts in the film's visual or
          narrative style (e.g., when outdoor scenes give way to indoor, or day
          transitions to night).
        </Typography>
      </Box>
    </Paper>
  );
}
