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
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
} from "@mui/material";

/**
 * FacetConnectionMatrix
 *
 * Displays connections between facet values as an interactive matrix/heatmap
 * where cells show the number of shared scenes between two values.
 */
export default function FacetConnectionMatrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFacet, setSelectedFacet] = useState("keywords");
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Build the matrix data based on selected facet
  const matrixData = useMemo(() => {
    if (!data || !data.kaadrid) return { values: [], matrix: [], maxCount: 0 };

    const scenes = data.kaadrid;
    const facet = selectedFacet;

    // Map to store all unique values for this facet
    const valueMap = new Map(); // value -> { count: number, scenes: [] }

    // Collect all values and their scenes
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
          ajad: scene.ajad,
        });
      });
    });

    // Get top values (limit to avoid huge matrix)
    const topValues = Array.from(valueMap.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 30) // Top 30 values
      .map(([value]) => value);

    // Build connection matrix
    const matrix = [];
    let maxCount = 0;

    topValues.forEach((value1, i) => {
      const row = [];
      topValues.forEach((value2, j) => {
        if (i === j) {
          // Diagonal: show total count for this value
          row.push({
            count: valueMap.get(value1).count,
            type: "self",
            scenes: valueMap.get(value1).scenes,
          });
        } else {
          // Find shared scenes
          const scenes1 = new Set(
            valueMap.get(value1).scenes.map((s) => s.index)
          );
          const sharedScenes = valueMap
            .get(value2)
            .scenes.filter((s) => scenes1.has(s.index));

          const count = sharedScenes.length;
          if (count > maxCount && i !== j) maxCount = count;

          row.push({
            count,
            type: "connection",
            scenes: sharedScenes,
          });
        }
      });
      matrix.push(row);
    });

    return { values: topValues, matrix, maxCount };
  }, [data, selectedFacet]);

  // Get color for cell based on count
  const getCellColor = (cell, maxCount) => {
    if (cell.type === "self") {
      return "rgba(100, 100, 100, 0.15)";
    }
    if (cell.count === 0) {
      return "transparent";
    }
    const intensity = cell.count / maxCount;
    return `rgba(33, 150, 243, ${0.2 + intensity * 0.7})`;
  };

  const handleCellClick = (cell, value1, value2) => {
    if (cell.count > 0 && cell.type === "connection") {
      setSelectedCell({ cell, value1, value2 });
      setModalOpen(true);
    }
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

  if (!data || matrixData.values.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="info">
          No connections found for the selected facet.
        </Alert>
      </Paper>
    );
  }

  const cellSize = 40;

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Facet Connection Matrix</Typography>

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
        Matrix showing connections between top{" "}
        <strong>
          {facetOptions.find((f) => f.value === selectedFacet)?.label}
        </strong>{" "}
        values. Darker cells = more shared scenes. Click cells to see details.
      </Typography>

      <Box sx={{ mt: 3, overflowX: "auto", overflowY: "auto", maxHeight: 800 }}>
        <Box sx={{ display: "inline-block", minWidth: "fit-content" }}>
          {/* Row labels */}
          <Box sx={{ display: "flex", mb: 1 }}>
            <Box sx={{ width: 150, flexShrink: 0 }} />
            {matrixData.values.map((value, i) => (
              <Tooltip key={i} title={value} arrow>
                <Box
                  sx={{
                    width: cellSize,
                    height: 150,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      transform: "rotate(-45deg)",
                      transformOrigin: "left bottom",
                      whiteSpace: "nowrap",
                      fontSize: "11px",
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mb: -8,
                      ml: 2,
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Matrix rows */}
          {matrixData.matrix.map((row, i) => (
            <Box key={i} sx={{ display: "flex", mb: 0.5 }}>
              {/* Row label */}
              <Tooltip title={matrixData.values[i]} arrow>
                <Box
                  sx={{
                    width: 150,
                    height: cellSize,
                    display: "flex",
                    alignItems: "center",
                    pr: 1,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "11px",
                      textAlign: "right",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {matrixData.values[i]}
                  </Typography>
                </Box>
              </Tooltip>

              {/* Cells */}
              {row.map((cell, j) => (
                <Tooltip
                  key={j}
                  title={
                    cell.type === "self"
                      ? `${matrixData.values[i]}: ${cell.count} scenes`
                      : cell.count > 0
                      ? `${cell.count} shared scene${cell.count > 1 ? "s" : ""}`
                      : "No shared scenes"
                  }
                  arrow
                >
                  <Box
                    onClick={() =>
                      handleCellClick(
                        cell,
                        matrixData.values[i],
                        matrixData.values[j]
                      )
                    }
                    sx={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getCellColor(cell, matrixData.maxCount),
                      border: "1px solid #ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:
                        cell.count > 0 && cell.type === "connection"
                          ? "pointer"
                          : "default",
                      flexShrink: 0,
                      "&:hover": {
                        opacity:
                          cell.count > 0 && cell.type === "connection"
                            ? 0.8
                            : 1,
                        outline:
                          cell.count > 0 && cell.type === "connection"
                            ? "2px solid #1976d2"
                            : "none",
                      },
                    }}
                  >
                    {cell.count > 0 && cell.type === "connection" && (
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "10px", fontWeight: "bold" }}
                      >
                        {cell.count}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Showing top {matrixData.values.length} values with connections
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
          {selectedCell && (
            <>
              Scenes Connecting:{" "}
              <Chip label={selectedCell.value1} sx={{ mx: 0.5 }} /> and{" "}
              <Chip label={selectedCell.value2} sx={{ mx: 0.5 }} />
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedCell && selectedCell.cell.scenes && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {selectedCell.cell.scenes.length} scene
                {selectedCell.cell.scenes.length > 1 ? "s" : ""} contain both
                values:
              </Typography>

              {selectedCell.cell.scenes.map((scene, idx) => (
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
                  {idx < selectedCell.cell.scenes.length - 1 && (
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
