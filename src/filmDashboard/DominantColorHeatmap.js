import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";

/**
 * DominantColorHeatmap
 *
 * Props:
 *   scenes: Array<{ filecode: string, colorcodes: string[]|undefined, avgColor?: string }>
 *   colorMode: 'palette' | 'average' (default: 'palette')
 *
 * - If colorMode==='palette', shows a heatmap: X=scene, Y=colorcodes, cell=hex.
 * - If colorMode==='average', shows a single color bar per scene (avgColor).
 */
export default function DominantColorHeatmap({
  scenes,
  colorMode = "palette",
}) {
  // Find max number of colorcodes in any scene
  const maxColors =
    colorMode === "palette"
      ? Math.max(
          ...scenes.map((s) => (s.colorcodes ? s.colorcodes.length : 0)),
          0
        )
      : 1;

  return (
    <Box sx={{ width: "100%", overflowX: "auto", py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Dominant Color Palette Heatmap
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", minHeight: 60 }}>
        {/* X-axis: scenes */}
        {scenes.map((scene, idx) => (
          <Box
            key={scene.filecode || idx}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mx: 0.2,
            }}
          >
            {colorMode === "palette" &&
            scene.colorcodes &&
            scene.colorcodes.length > 0 ? (
              // Show color palette as vertical stack
              <Box sx={{ display: "flex", flexDirection: "column-reverse" }}>
                {Array.from({ length: maxColors }).map((_, cidx) => {
                  const hex = scene.colorcodes[cidx] || "#eee";
                  return (
                    <Tooltip key={cidx} title={hex} arrow placement="right">
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          bgcolor: hex,
                          border: "1px solid #ccc",
                          mb: cidx < maxColors - 1 ? 0.5 : 0,
                          borderRadius: 1,
                          transition: "background 0.2s",
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ) : colorMode === "average" && scene.avgColor ? (
              // Show average color as a bar
              <Tooltip title={scene.avgColor} arrow placement="right">
                <Box
                  sx={{
                    width: 18,
                    height: 36,
                    bgcolor: scene.avgColor,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    transition: "background 0.2s",
                  }}
                />
              </Tooltip>
            ) : (
              <Box
                sx={{
                  width: 18,
                  height: 36,
                  bgcolor: "#eee",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                }}
              />
            )}
            {/* X-axis label (filecode or idx) */}
            <Typography
              variant="caption"
              sx={{ mt: 0.5, fontSize: 10, color: "#888" }}
            >
              {scene.filecode || idx + 1}
            </Typography>
          </Box>
        ))}
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
