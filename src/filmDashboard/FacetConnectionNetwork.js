import React, { useState, useEffect, useMemo, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

/**
 * FacetConnectionNetwork
 *
 * Displays a network graph showing how different facets (actions, keywords, shot_types, etc.)
 * are connected through shared scenes.
 *
 * Nodes: Values of the selected facet (e.g., specific actions, keywords)
 * Edges: Scenes that connect two values (e.g., scenes containing both "running" and "jumping")
 */
export default function FacetConnectionNetwork() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacet, setSelectedFacet] = useState("keywords");
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const graphRef = useRef();

  // Fetch data from the URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/11450/11450_kaadrid.json"
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

  // Available facets to choose from
  const facetOptions = [
    { value: "actions", label: "Actions" },
    { value: "keywords", label: "Keywords" },
    { value: "shot_type", label: "Shot Type" },
    { value: "placement", label: "Placement" },
    { value: "imagetype", label: "Image Type" },
    { value: "season", label: "Season" },
    { value: "daytime", label: "Daytime" },
    { value: "persons", label: "Persons" },
    { value: "objects", label: "Objects" },
  ];

  // Build the network graph based on selected facet
  const graphData = useMemo(() => {
    if (!data || !data.kaadrid) return { nodes: [], links: [] };

    const scenes = data.kaadrid;
    const facet = selectedFacet;

    // Map to store all unique values for this facet
    const valueMap = new Map(); // value -> { count: number, scenes: [] }

    // First pass: collect all values and their scenes
    scenes.forEach((scene, sceneIndex) => {
      let values = [];

      // Get values based on facet type
      if (Array.isArray(scene[facet])) {
        values = scene[facet].filter((v) => v && v.trim() !== "");
      } else if (
        scene[facet] &&
        typeof scene[facet] === "string" &&
        scene[facet] !== "not clear"
      ) {
        values = [scene[facet]];
      }

      // Add this scene to each value
      values.forEach((value) => {
        if (!valueMap.has(value)) {
          valueMap.set(value, { count: 0, scenes: [] });
        }
        const entry = valueMap.get(value);
        entry.count++;
        entry.scenes.push({
          index: sceneIndex,
          snr: scene.snr,
          explanation: scene.explanation,
        });
      });
    });

    // Build nodes (only include values that appear in at least 2 scenes)
    const nodes = Array.from(valueMap.entries())
      .filter(([_, data]) => data.count >= 2)
      .map(([value, data]) => ({
        id: value,
        name: value,
        count: data.count,
        scenes: data.scenes,
      }))
      .sort((a, b) => b.count - a.count);

    // Build edges (connections through shared scenes)
    const edgeMap = new Map(); // "nodeA|||nodeB" -> { scenes: [] }

    scenes.forEach((scene, sceneIndex) => {
      let values = [];

      if (Array.isArray(scene[facet])) {
        values = scene[facet].filter((v) => v && v.trim() !== "");
      } else if (
        scene[facet] &&
        typeof scene[facet] === "string" &&
        scene[facet] !== "not clear"
      ) {
        values = [scene[facet]];
      }

      // Only consider values that made it into nodes
      const nodeIds = new Set(nodes.map((n) => n.id));
      values = values.filter((v) => nodeIds.has(v));

      // Create edges for all pairs of values in this scene
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const [v1, v2] = [values[i], values[j]].sort();
          const edgeKey = `${v1}|||${v2}`;

          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, { scenes: [] });
          }

          edgeMap.get(edgeKey).scenes.push({
            index: sceneIndex,
            snr: scene.snr,
            explanation: scene.explanation,
            ajad: scene.ajad,
          });
        }
      }
    });

    // Build links
    const links = Array.from(edgeMap.entries())
      .map(([key, data]) => {
        const [source, target] = key.split("|||");
        return {
          id: key,
          source,
          target,
          value: data.scenes.length,
          scenes: data.scenes,
        };
      })
      .filter((link) => link.value >= 1); // At least 1 shared scene

    return { nodes, links };
  }, [data, selectedFacet]);

  // Handle edge click
  const handleEdgeClick = (link) => {
    setSelectedEdge(link);
    setModalOpen(true);
  };

  // Node color based on count
  const nodeColor = (node) => {
    const maxCount = Math.max(...graphData.nodes.map((n) => n.count));
    const ratio = node.count / maxCount;
    const hue = 200 + ratio * 60; // Blue to cyan
    const saturation = 50 + ratio * 40;
    const lightness = 60 - ratio * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Generate canvas for node sprite with label
  const generateNodeCanvas = (node, color) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;

    // Draw circle
    const radius = 80;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(128, 128, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = "#000";
    ctx.font = "bold 24px Sans-Serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap for long labels
    const maxWidth = 160;
    const words = node.name.split(" ");
    let line = "";
    let lines = [];

    words.forEach((word) => {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    });
    lines.push(line);

    // Draw each line
    const lineHeight = 26;
    const startY = 128 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line.trim(), 128, startY + i * lineHeight);
    });

    return canvas;
  };

  // Link color and width based on shared scenes
  const linkColor = (link) => {
    return link === selectedEdge ? "#ff5722" : "rgba(100, 100, 100, 0.3)";
  };

  const linkWidth = (link) => {
    return Math.max(1, Math.sqrt(link.value) * 1.5);
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

  if (!data || graphData.nodes.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="info">
          No connections found for the selected facet.
        </Alert>
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
        <Typography variant="h5">Facet Connection Network</Typography>

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
        Showing connections between{" "}
        <strong>
          {facetOptions.find((f) => f.value === selectedFacet)?.label}
        </strong>{" "}
        values through shared scenes. Click on edges to see connecting scenes.
      </Typography>

      <Box
        sx={{ height: 700, border: "1px solid #ddd", borderRadius: 1, mt: 2 }}
      >
        <ForceGraph3D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node) => `${node.name} (${node.count} scenes)`}
          nodeColor={nodeColor}
          nodeRelSize={6}
          nodeVal={(node) => Math.sqrt(node.count) * 2}
          nodeThreeObject={(node) => {
            const sprite = new window.THREE.Sprite(
              new window.THREE.SpriteMaterial({
                map: new window.THREE.CanvasTexture(
                  generateNodeCanvas(node, nodeColor(node))
                ),
              })
            );
            sprite.scale.set(12, 12, 1);
            return sprite;
          }}
          linkLabel={(link) =>
            `${link.value} shared scene${link.value > 1 ? "s" : ""}`
          }
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={0.5}
          linkDirectionalParticles={0}
          onNodeClick={(node) => {
            // Focus camera on clicked node
            const distance = 400;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            if (graphRef.current) {
              graphRef.current.cameraPosition(
                {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
                },
                node,
                3000
              );
            }
          }}
          onLinkClick={handleEdgeClick}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.2}
          d3Force="charge"
          d3ForceConfig={{
            charge: {
              strength: -800,
              distanceMax: 500,
            },
            link: {
              distance: 200,
            },
          }}
          cooldownTicks={300}
          warmupTicks={100}
          enableNodeDrag={true}
          enableNavigationControls={true}
          showNavInfo={false}
        />
      </Box>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Network contains {graphData.nodes.length} nodes and{" "}
          {graphData.links.length} connections
        </Typography>
      </Box>

      {/* Modal for showing connecting scenes */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEdge && (
            <>
              Scenes Connecting:{" "}
              <Chip label={selectedEdge.source} sx={{ mx: 0.5 }} /> and{" "}
              <Chip label={selectedEdge.target} sx={{ mx: 0.5 }} />
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedEdge && selectedEdge.scenes && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {selectedEdge.scenes.length} scene
                {selectedEdge.scenes.length > 1 ? "s" : ""} contain both values:
              </Typography>

              {selectedEdge.scenes.map((scene, idx) => (
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
                        ({scene.ajad[0].toFixed(1)}s -{" "}
                        {scene.ajad[1].toFixed(1)}s)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {scene.explanation}
                  </Typography>
                  {idx < selectedEdge.scenes.length - 1 && (
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
