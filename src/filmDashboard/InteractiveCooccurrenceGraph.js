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
  DialogActions,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ForceGraph2D from "react-force-graph-2d";

export default function InteractiveCooccurrenceGraph() {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parameters
  const [selectedFacet, setSelectedFacet] = useState("keywords");
  const [minCooccurrence, setMinCooccurrence] = useState(2);

  // Fixed graph physics parameters
  const maxNodes = 999999; // Display all nodes
  const linkDistance = 150;
  const chargeStrength = -400;

  // Modals
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeScenes, setSelectedNodeScenes] = useState([]);

  const videoBaseUrl =
    "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/stseenid/11450_stseenid";

  // Fetch scene data
  useEffect(() => {
    fetch(
      "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/11450/11450_kaadrid2.json"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        console.log("Data type:", typeof data);
        console.log("Is array?:", Array.isArray(data));

        // Handle different possible data structures
        let scenesArray = [];

        if (Array.isArray(data)) {
          scenesArray = data;
        } else if (data && typeof data === "object") {
          // Check if it has a scenes or kaadrid property
          if (Array.isArray(data.scenes)) {
            scenesArray = data.scenes;
          } else if (Array.isArray(data.kaadrid)) {
            scenesArray = data.kaadrid;
          } else {
            console.log("Data keys:", Object.keys(data));
          }
        }

        console.log("Setting scenes array with length:", scenesArray.length);
        setScenes(scenesArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading scene data:", err);
        setScenes([]);
        setLoading(false);
      });
  }, []);

  // Build co-occurrence graph data
  const graphData = useMemo(() => {
    if (scenes.length === 0) {
      console.log("No scenes loaded yet");
      return { nodes: [], links: [] };
    }

    console.log(
      "Building graph with",
      scenes.length,
      "scenes for facet:",
      selectedFacet
    );

    // Extract all values for the selected facet
    const valueCounts = new Map();
    const scenesByValue = new Map();

    scenes.forEach((scene, sceneIdx) => {
      // Access facet directly from scene, not from scene.facets
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

    console.log("Found", valueCounts.size, "unique values");
    if (valueCounts.size > 0) {
      console.log(
        "Sample values:",
        Array.from(valueCounts.entries()).slice(0, 5)
      );
    }

    // Filter to top N most frequent values
    const topValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNodes)
      .map(([value]) => value);

    console.log("Top values:", topValues);

    // Create nodes
    const nodes = topValues.map((value) => ({
      id: value,
      name: value,
      count: valueCounts.get(value),
      scenes: scenesByValue.get(value),
    }));

    console.log("Created", nodes.length, "nodes");

    // Create links based on co-occurrence in scenes
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

      // Create links between all pairs of values in this scene
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

    // Filter links by minimum co-occurrence
    Array.from(linkMap.values()).forEach((link) => {
      if (link.value >= minCooccurrence) {
        links.push(link);
      }
    });

    console.log(
      "Created",
      links.length,
      "links with min co-occurrence:",
      minCooccurrence
    );
    console.log("Graph data:", { nodes, links });

    return { nodes, links };
  }, [scenes, selectedFacet, minCooccurrence, maxNodes]);

  // Handle link click - show scene info
  const handleLinkClick = useCallback((link) => {
    console.log("Link clicked:", link);
    if (link && link.scenes && link.scenes.length > 0) {
      // Show first scene for now, or could show a list
      setSelectedScene(link.scenes[0]);
      setSceneModalOpen(true);
    } else {
      console.log("No scenes in link");
    }
  }, []);

  // Handle node click - show all scenes with this value
  const handleNodeClick = useCallback((node) => {
    console.log("Node clicked:", node);
    if (node) {
      setSelectedNode(node);
      setSelectedNodeScenes(node.scenes || []);
      setNodeModalOpen(true);
    }
  }, []);

  // Format time helper
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
        <Typography variant="h4" gutterBottom>
          Interactive Co-occurrence Network
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Nodes = {selectedFacet} values, Links = scenes where values co-occur
        </Typography>

        {/* Controls */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Graph Parameters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
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

          {/* Stats */}
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1, display: "block" }}
        >
          Nodes: {graphData.nodes.length} | Links: {graphData.links.length}
        </Typography>
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            width={1200}
            height={650}
            nodeLabel={(node) => `${node.name} (${node.count} scenes)`}
            nodeAutoColorBy="id"
            nodeRelSize={3}
            nodeVal={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              // Draw node circle
              ctx.fillStyle = node.color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI);
              ctx.fill();

              // Draw label
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // Draw background for label
              const textWidth = ctx.measureText(label).width;
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
              ctx.fillRect(
                node.x - textWidth / 2 - 2,
                node.y + 5 - fontSize / 2,
                textWidth + 4,
                fontSize + 2
              );

              // Draw label text
              ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
              ctx.fillText(label, node.x, node.y + 5 + fontSize / 2);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
              ctx.fill();
            }}
            linkLabel={(link) =>
              `${link.source.id} + ${link.target.id}: ${link.value} co-occurrences - Click to view all scenes`
            }
            linkWidth={(link) => Math.max(1, Math.sqrt(link.value) * 0.5)}
            linkDirectionalParticles={1}
            linkDirectionalParticleWidth={1.5}
            linkColor={() => "rgba(100, 100, 100, 0.3)"}
            linkHoverPrecision={15}
            linkPointerAreaPaint={(link, color, ctx) => {
              const start = link.source;
              const end = link.target;
              ctx.strokeStyle = color;
              ctx.lineWidth = 8;
              ctx.beginPath();
              ctx.moveTo(start.x, start.y);
              ctx.lineTo(end.x, end.y);
              ctx.stroke();
            }}
            enablePointerInteraction={true}
            enableNodeDrag={true}
            onNodeClick={(node) => {
              console.log("✅ Node clicked:", node.name);
              if (node && node.scenes) {
                setSelectedNode(node);
                setSelectedNodeScenes(node.scenes);
                setNodeModalOpen(true);
              }
            }}
            onLinkClick={(link) => {
              console.log(
                "✅ Link clicked:",
                link.source.id,
                "->",
                link.target.id
              );
              if (link && link.scenes && link.scenes.length > 0) {
                setSelectedNode({
                  name: `${link.source.id} + ${link.target.id}`,
                  count: link.scenes.length,
                });
                setSelectedNodeScenes(link.scenes);
                setNodeModalOpen(true);
              }
            }}
            onNodeHover={(node) => {
              document.body.style.cursor = node ? "pointer" : "default";
            }}
            onLinkHover={(link) => {
              document.body.style.cursor = link ? "pointer" : "default";
            }}
            d3VelocityDecay={0.2}
            linkDistance={linkDistance}
            d3AlphaDecay={0.005}
            cooldownTicks={200}
            d3Force={{
              charge: { strength: chargeStrength },
              collide: { radius: 15, strength: 0.5 },
            }}
          />
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

        {/* Instructions */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          💡 Click nodes to see all scenes with that value. Click links (edges)
          to see a scene where both values appear together. Drag nodes to
          reorganize.
        </Typography>
      </Paper>

      {/* Scene Modal */}
      <Dialog
        open={sceneModalOpen}
        onClose={() => setSceneModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Scene {selectedScene?.scene?.snr || selectedScene?.sceneIdx + 1}
          {selectedScene?.scene?.start && selectedScene?.scene?.end && (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              ({Math.floor(selectedScene.scene.start / 60)}:
              {(selectedScene.scene.start % 60).toFixed(0).padStart(2, "0")} -{" "}
              {Math.floor(selectedScene.scene.end / 60)}:
              {(selectedScene.scene.end % 60).toFixed(0).padStart(2, "0")})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedScene && (
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              {selectedScene.scene.explanation && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedScene.scene.explanation}
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
                    src={`${videoBaseUrl}/11450-Scene-${String(
                      selectedScene.scene.snr || selectedScene.sceneIdx + 1
                    ).padStart(3, "0")}.mp4`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Node Modal - Shows all scenes with this value */}
      <Dialog
        open={nodeModalOpen}
        onClose={() => setNodeModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNode?.name.includes("+")
            ? `Co-occurring: ${selectedNode?.name}`
            : `Scenes with "${selectedNode?.name}"`}{" "}
          ({selectedNodeScenes.length} scenes)
          <IconButton
            onClick={() => setNodeModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
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
                    src={`${videoBaseUrl}/11450-Scene-${String(
                      scene.snr || sceneIdx + 1
                    ).padStart(3, "0")}.mp4`}
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
        <DialogActions>
          <Button onClick={() => setNodeModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
