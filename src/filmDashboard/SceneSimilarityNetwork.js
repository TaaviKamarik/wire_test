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
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import ForceGraph2D from "react-force-graph-2d";

/**
 * SceneSimilarityNetwork
 *
 * Calculates similarity scores between scenes based on shared facets
 * and visualizes as a network where similar scenes are connected.
 * Helps find "almost matching" patterns and scene relationships.
 */
export default function SceneSimilarityNetwork() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [minSimilarity, setMinSimilarity] = useState(3);
  const [maxConnections, setMaxConnections] = useState(50);

  // Fetch data from the URL
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

  // Calculate similarity between two scenes
  const calculateSimilarity = (scene1, scene2) => {
    let score = 0;

    // Compare single-value facets
    if (
      scene1.shot_type &&
      scene1.shot_type === scene2.shot_type &&
      scene1.shot_type !== "not clear"
    ) {
      score += 1;
    }
    if (
      scene1.placement &&
      scene1.placement === scene2.placement &&
      scene1.placement !== "not clear"
    ) {
      score += 1;
    }
    if (
      scene1.daytime &&
      scene1.daytime === scene2.daytime &&
      scene1.daytime !== "not clear"
    ) {
      score += 1;
    }
    if (
      scene1.season &&
      scene1.season === scene2.season &&
      scene1.season !== "not clear"
    ) {
      score += 1;
    }
    if (
      scene1.imagetype &&
      scene1.imagetype === scene2.imagetype &&
      scene1.imagetype !== "not clear"
    ) {
      score += 1;
    }

    // Compare array facets (keywords, actions, persons, objects)
    const compareArrays = (arr1, arr2) => {
      if (!arr1 || !arr2 || !Array.isArray(arr1) || !Array.isArray(arr2))
        return 0;
      const set1 = new Set(arr1.map((v) => v?.toLowerCase()));
      const set2 = new Set(arr2.map((v) => v?.toLowerCase()));
      let matches = 0;
      set1.forEach((v) => {
        if (v && set2.has(v)) matches++;
      });
      return matches;
    };

    score += compareArrays(scene1.keywords, scene2.keywords);
    score += compareArrays(scene1.actions, scene2.actions);
    score += compareArrays(scene1.persons, scene2.persons) * 1.5; // Weight persons higher
    score += compareArrays(scene1.objects, scene2.objects) * 0.5; // Weight objects lower

    return score;
  };

  // Build graph data
  const graphData = useMemo(() => {
    if (!data || !data.kaadrid) return { nodes: [], links: [] };

    const scenes = data.kaadrid;
    const nodes = scenes.map((scene, idx) => ({
      id: idx,
      name: `Scene ${scene.snr}`,
      snr: scene.snr,
      scene: scene,
    }));

    const links = [];

    // Calculate similarities between all scene pairs
    for (let i = 0; i < scenes.length; i++) {
      const similarities = [];

      for (let j = 0; j < scenes.length; j++) {
        if (i !== j) {
          const similarity = calculateSimilarity(scenes[i], scenes[j]);
          if (similarity >= minSimilarity) {
            similarities.push({ targetIdx: j, similarity });
          }
        }
      }

      // Sort by similarity and take top connections
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topConnections = similarities.slice(0, maxConnections);

      topConnections.forEach(({ targetIdx, similarity }) => {
        // Only add if not already added from the other direction
        if (i < targetIdx) {
          links.push({
            source: i,
            target: targetIdx,
            value: similarity,
          });
        }
      });
    }

    return { nodes, links };
  }, [data, minSimilarity, maxConnections]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setModalOpen(true);
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Scene Similarity Network</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Scenes connected by similarity. Thicker lines = more shared
        characteristics. Click a scene to see details.
      </Typography>

      {/* Controls */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" gutterBottom display="block">
            Minimum similarity score: {minSimilarity}
          </Typography>
          <Slider
            value={minSimilarity}
            onChange={(e, val) => setMinSimilarity(val)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Higher = only show scenes with many shared facets
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" gutterBottom display="block">
            Max connections per scene: {maxConnections}
          </Typography>
          <Slider
            value={maxConnections}
            onChange={(e, val) => setMaxConnections(val)}
            min={1}
            max={100}
            marks={[
              { value: 1, label: "1" },
              { value: 25, label: "25" },
              { value: 50, label: "50" },
              { value: 75, label: "75" },
              { value: 100, label: "100" },
            ]}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Lower = cleaner graph, higher = more connections
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {graphData.nodes.length} scenes • {graphData.links.length} connections
        </Typography>
      </Box>

      {/* Network Graph */}
      <Box
        sx={{
          width: "100%",
          height: 600,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          bgcolor: "grey.50",
        }}
      >
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node) => {
            // Color by number of connections
            const connections = graphData.links.filter(
              (l) => l.source.id === node.id || l.target.id === node.id
            ).length;
            if (connections > 20) return "#1976d2";
            if (connections > 10) return "#42a5f5";
            if (connections > 5) return "#90caf9";
            return "#bbdefb";
          }}
          nodeRelSize={6}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#333";
            ctx.fillText(label, node.x, node.y + 8);
          }}
          linkColor={() => "rgba(100, 100, 100, 0.3)"}
          linkWidth={(link) => Math.sqrt(link.value)}
          linkDirectionalParticles={0}
          onNodeClick={handleNodeClick}
          d3VelocityDecay={0.3}
          cooldownTicks={100}
        />
      </Box>

      {/* Modal for showing scene details */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNode && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Scene {selectedNode.snr}</Typography>
              {selectedNode.scene.ajad &&
                selectedNode.scene.ajad.length === 2 && (
                  <Chip
                    label={`${Math.floor(selectedNode.scene.ajad[0] / 60)}:${(
                      selectedNode.scene.ajad[0] % 60
                    )
                      .toFixed(0)
                      .padStart(2, "0")} - ${Math.floor(
                      selectedNode.scene.ajad[1] / 60
                    )}:${(selectedNode.scene.ajad[1] % 60)
                      .toFixed(0)
                      .padStart(2, "0")}`}
                    variant="outlined"
                  />
                )}
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedNode.scene.explanation}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Facet details */}
              <Typography variant="subtitle2" gutterBottom>
                Scene Characteristics:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                {selectedNode.scene.shot_type &&
                  selectedNode.scene.shot_type !== "not clear" && (
                    <Chip
                      label={`Shot: ${selectedNode.scene.shot_type}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                {selectedNode.scene.placement &&
                  selectedNode.scene.placement !== "not clear" && (
                    <Chip
                      label={`Place: ${selectedNode.scene.placement}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                {selectedNode.scene.daytime &&
                  selectedNode.scene.daytime !== "not clear" && (
                    <Chip
                      label={`Time: ${selectedNode.scene.daytime}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                {selectedNode.scene.season &&
                  selectedNode.scene.season !== "not clear" && (
                    <Chip
                      label={`Season: ${selectedNode.scene.season}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
              </Box>

              {selectedNode.scene.keywords &&
                Array.isArray(selectedNode.scene.keywords) &&
                selectedNode.scene.keywords.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Keywords:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {selectedNode.scene.keywords.map((kw, idx) => (
                        <Chip
                          key={idx}
                          label={kw}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              {selectedNode.scene.actions &&
                Array.isArray(selectedNode.scene.actions) &&
                selectedNode.scene.actions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Actions:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {selectedNode.scene.actions.map((action, idx) => (
                        <Chip
                          key={idx}
                          label={action}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              {selectedNode.scene.persons &&
                Array.isArray(selectedNode.scene.persons) &&
                selectedNode.scene.persons.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Persons:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {selectedNode.scene.persons.map((person, idx) => (
                        <Chip
                          key={idx}
                          label={person}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              <Divider sx={{ my: 2 }} />

              {/* Video Player */}
              <Box sx={{ mt: 2 }}>
                <video
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "4px",
                    backgroundColor: "#000",
                  }}
                >
                  <source
                    src={`https://minitorn.tlu.ee/~jaagup/oma/too/25/09/stseenid/11450_stseenid/11450-Scene-${String(
                      selectedNode.snr
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
    </Paper>
  );
}
