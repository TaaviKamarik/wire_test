import React from "react";
import HeatMapGrid from "react-heatmap-grid";
import { Box, Typography } from "@mui/material";

/**
 * DominantColorHeatmapGrid
 *
 * Props:
 *   scenes: Array<{ filecode: string, colorcodes: string[]|undefined }>
 *   maxColors: number (optional, default: max found)
 *
 * - X-axis: scene order (filecode)
 * - Y-axis: color index (0=most dominant)
 * - Each cell's background = color hex
 */
export default function DominantColorHeatmapNivo({ scenes, maxColors }) {
  // Defensive: ensure scenes is an array and each colorcodes is an array
  const safeScenes = Array.isArray(scenes)
    ? scenes.map((scene) => ({
        ...scene,
        colorcodes: Array.isArray(scene?.colorcodes) ? scene.colorcodes : [],
      }))
    : [];

  // Find max palette length
  const maxY =
    typeof maxColors === "number"
      ? maxColors
      : safeScenes.length > 0
      ? safeScenes.reduce(
          (max, s) =>
            Math.max(
              max,
              Array.isArray(s.colorcodes) ? s.colorcodes.length : 0
            ),
          0
        )
      : 0;

  // X labels: scene identifiers
  const xLabels = safeScenes
    .map((scene, sidx) => scene.filecode || `Scene_${sidx + 1}`)
    .filter(Boolean);

  // Y labels: Palette color index (top=most dominant)
  const yLabels = Array.from({ length: maxY }).map(
    (_, idx) => `Color ${idx + 1}`
  );

  // Data: 2D array [x][y] = color hex (react-heatmap-grid expects [x][y])
  const data = safeScenes.map((scene) =>
    Array.from({ length: maxY }).map((_, colorIdx) => {
      const hex =
        Array.isArray(scene.colorcodes) && scene.colorcodes[colorIdx]
          ? scene.colorcodes[colorIdx]
          : "#eeeeee";
      // Ensure valid hex string format
      if (typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex)) {
        return hex.toLowerCase();
      }
      return "#eeeeee"; // fallback for invalid values
    })
  );
  // Debug: log the data structure and first row of color values
  // eslint-disable-next-line no-console
  console.log("Heatmap debug", {
    xLabels,
    yLabels,
    data,
    safeScenes,
    firstRow: data[0],
  });

  if (!data.length || !xLabels.length || !yLabels.length || maxY === 0) {
    return (
      <Box sx={{ width: "100%", py: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dominant Color Palette Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No color palette data available for visualization.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto", py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Dominant Color Palette Heatmap
      </Typography>
      <Box
        sx={{ minWidth: Math.max(320, xLabels.length * 28), maxWidth: "100%" }}
      >
        <HeatMapGrid
          data={data}
          xLabels={xLabels}
          yLabels={yLabels}
          cellStyle={(_x, _y, value) => {
            // Defensive: ensure value is a string
            const val = typeof value === "string" ? value : "";
            const isHex = /^#[0-9a-fA-F]{6}$/.test(val);
            return {
              background: isHex ? val : "#bbb", // fallback color
              color: isHex
                ? val.toLowerCase() === "#000000"
                  ? "#fff"
                  : "#222"
                : "#222",
              fontSize: "10px",
              cursor: "pointer",
              minWidth: 24,
              minHeight: 22,
              maxWidth: 32,
              maxHeight: 28,
              padding: 0,
            };
          }}
          cellRender={(_x, _y, value) => null}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        X: Scene order &nbsp;|&nbsp; Y: Dominant palette color (top=most
        dominant)
      </Typography>
    </Box>
  );
}
