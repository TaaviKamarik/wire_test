import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import ForceGraph2D from "react-force-graph-2d";

/**
 * SceneConstellationGraph
 *
 * Interactive force-directed graph where:
 * - Nodes = individual scenes (size = duration)
 * - Links = shared facets between scenes (thickness = number of matches)
 * - Fully interactive: drag nodes, filter by facet types, explore clusters
 */
export default function SceneConstellationGraph() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [minSharedFacets, setMinSharedFacets] = useState(3);
  const [maxConnections, setMaxConnections] = useState(5);

  // Facet filter states
  const [activeFacets, setActiveFacets] = useState({
    actions: true,
    keywords: true,
    shot_type: true,
    placement: true,
    imagetype: true,
    season: true,
    daytime: true,
    persons: true,
    objects: true,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/11450/11450_kaadrid2.json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate scene similarity based on shared facets
  const calculateSharedFacets = useCallback(
    (scene1, scene2) => {
      let sharedCount = 0;
      const details = [];

      Object.keys(activeFacets).forEach((facet) => {
        if (!activeFacets[facet]) return;

        const val1 = scene1[facet];
        const val2 = scene2[facet];

        if (!val1 || !val2) return;

        // Handle array facets
        if (Array.isArray(val1) && Array.isArray(val2)) {
          const set1 = new Set(val1.map((v) => v.toLowerCase()));
          const set2 = new Set(val2.map((v) => v.toLowerCase()));
          const intersection = [...set1].filter((v) => set2.has(v));

          if (intersection.length > 0) {
            sharedCount += intersection.length;
            details.push({
              facet,
              values: intersection,
              count: intersection.length,
            });
          }
        } else {
          // Single value facets
          const v1 =
            typeof val1 === "string" ? val1.toLowerCase() : String(val1);
          const v2 =
            typeof val2 === "string" ? val2.toLowerCase() : String(val2);

          if (v1 === v2 && v1 !== "not clear") {
            sharedCount += 1;
            details.push({ facet, values: [v1], count: 1 });
          }
        }
      });

      return { count: sharedCount, details };
    },
    [activeFacets]
  );

  // Build graph data
  const graphData = useMemo(() => {
    if (!data || !data.kaadrid) return { nodes: [], links: [] };

    const scenes = data.kaadrid;

    // Create nodes (one per scene)
    const nodes = scenes.map((scene, index) => {
      const duration =
        scene.ajad && scene.ajad.length === 2
          ? scene.ajad[1] - scene.ajad[0]
          : 5;

      return {
        id: index,
        sceneNumber: scene.snr,
        duration,
        explanation: scene.explanation,
        filecode: scene.filecode,
        ajad: scene.ajad,
        ...scene, // Include all scene data
      };
    });

    // Calculate connections between scenes
    const linkMap = new Map();

    for (let i = 0; i < scenes.length; i++) {
      const connections = [];

      for (let j = i + 1; j < scenes.length; j++) {
        const shared = calculateSharedFacets(scenes[i], scenes[j]);

        if (shared.count >= minSharedFacets) {
          connections.push({
            targetIndex: j,
            sharedCount: shared.count,
            details: shared.details,
          });
        }
      }

      // Keep only top N connections for this scene
      connections.sort((a, b) => b.sharedCount - a.sharedCount);
      const topConnections = connections.slice(0, maxConnections);

      topConnections.forEach((conn) => {
        const linkKey = `${i}-${conn.targetIndex}`;
        linkMap.set(linkKey, {
          source: i,
          target: conn.targetIndex,
          value: conn.sharedCount,
          details: conn.details,
        });
      });
    }

    const links = Array.from(linkMap.values());

    return { nodes, links };
  }, [data, calculateSharedFacets, minSharedFacets, maxConnections]);

  const handleNodeClick = useCallback((node) => {
    setSelectedScene(node);
    setModalOpen(true);
  }, []);

  const handleFacetToggle = (facet) => {
    setActiveFacets((prev) => ({
      ...prev,
      [facet]: !prev[facet],
    }));
  };

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
        Scene Constellation Graph
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Interactive network showing scene connections. Node size = scene
        duration, link thickness = shared facets. Drag nodes to explore
        clusters.
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="caption" gutterBottom display="block">
            Minimum shared facets: {minSharedFacets}
          </Typography>
          <Slider
            value={minSharedFacets}
            onChange={(e, val) => setMinSharedFacets(val)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Higher = fewer, stronger connections
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="caption" gutterBottom display="block">
            Max connections per scene: {maxConnections}
          </Typography>
          <Slider
            value={maxConnections}
            onChange={(e, val) => setMaxConnections(val)}
            min={1}
            max={20}
            marks={[
              { value: 1, label: "1" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
            ]}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Limit connections to avoid clutter
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="caption" display="block" gutterBottom>
            Active facets for comparison:
          </Typography>
          <FormGroup row>
            {Object.keys(activeFacets).map((facet) => (
              <FormControlLabel
                key={facet}
                control={
                  <Checkbox
                    checked={activeFacets[facet]}
                    onChange={() => handleFacetToggle(facet)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption">
                    {facet.replace("_", " ")}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Grid>
      </Grid>

      {/* Graph */}
      {graphData.nodes.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            height: 700,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            bgcolor: "#fafafa",
          }}
        >
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={(node) =>
              `Scene ${node.sceneNumber}: ${
                node.explanation?.substring(0, 50) || "No description"
              }...`
            }
            nodeVal={(node) => Math.max(3, node.duration / 2)}
            nodeColor={(node) => {
              // Color by placement
              const placement = node.placement;
              if (placement === "outdoor") return "#4caf50";
              if (placement === "indoor") return "#2196f3";
              return "#9e9e9e";
            }}
            linkWidth={(link) => Math.sqrt(link.value)}
            linkColor={() => "rgba(150, 150, 150, 0.3)"}
            linkDirectionalParticles={0}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = `${node.sceneNumber}`;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(
                (n) => n + fontSize * 0.2
              );

              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              ctx.fillStyle = "#333";
              ctx.fillText(label, node.x, node.y);
            }}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTicks={0}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No connections found with current settings. Try lowering the minimum
          shared facets or adjusting filters.
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {graphData.nodes.length} scenes • {graphData.links.length} connections
        </Typography>
      </Box>

      {/* Scene Detail Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedScene && (
            <>
              Scene {selectedScene.sceneNumber}
              {selectedScene.ajad && selectedScene.ajad.length === 2 && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({Math.floor(selectedScene.ajad[0] / 60)}:
                  {(selectedScene.ajad[0] % 60).toFixed(0).padStart(2, "0")} -{" "}
                  {Math.floor(selectedScene.ajad[1] / 60)}:
                  {(selectedScene.ajad[1] % 60).toFixed(0).padStart(2, "0")})
                </Typography>
              )}
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedScene && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {selectedScene.explanation}
              </Typography>

              {/* Video Player */}
              {selectedScene.filecode && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <video
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      borderRadius: "4px",
                    }}
                    src={`https://minitorn.tlu.ee/~jaagup/oma/too/25/09/stseenid/11450_stseenid/${selectedScene.filecode}.mp4`}
                  />
                </Box>
              )}

              {/* Facet Details */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Scene Attributes:
                </Typography>
                <Grid container spacing={1}>
                  {selectedScene.shot_type && (
                    <Grid item xs={6}>
                      <Chip
                        label={`Shot: ${selectedScene.shot_type}`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {selectedScene.placement && (
                    <Grid item xs={6}>
                      <Chip
                        label={`Place: ${selectedScene.placement}`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {selectedScene.daytime && (
                    <Grid item xs={6}>
                      <Chip
                        label={`Time: ${selectedScene.daytime}`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {selectedScene.season && (
                    <Grid item xs={6}>
                      <Chip
                        label={`Season: ${selectedScene.season}`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {selectedScene.imagetype && (
                    <Grid item xs={6}>
                      <Chip
                        label={`Type: ${selectedScene.imagetype}`}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                </Grid>

                {selectedScene.keywords &&
                  Array.isArray(selectedScene.keywords) &&
                  selectedScene.keywords.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Keywords:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedScene.keywords.map((kw, idx) => (
                          <Chip
                            key={idx}
                            label={kw}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                {selectedScene.actions &&
                  Array.isArray(selectedScene.actions) &&
                  selectedScene.actions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Actions:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedScene.actions.map((action, idx) => (
                          <Chip
                            key={idx}
                            label={action}
                            size="small"
                            color="secondary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                {selectedScene.persons &&
                  Array.isArray(selectedScene.persons) &&
                  selectedScene.persons.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Persons:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedScene.persons.map((person, idx) => (
                          <Chip key={idx} label={person} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                {selectedScene.objects &&
                  Array.isArray(selectedScene.objects) &&
                  selectedScene.objects.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Objects:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedScene.objects.map((obj, idx) => (
                          <Chip
                            key={idx}
                            label={obj}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
