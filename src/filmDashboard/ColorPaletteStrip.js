import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

function getTopColors(scenes, topN = 8) {
  const colorCounts = {};
  scenes.forEach((s) => {
    (s.colorcodes || []).forEach((c) => {
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    });
  });
  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([color]) => color);
}

export default function ColorPaletteStrip({ scenes }) {
  const topColors = getTopColors(scenes);
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Dominant Color Palette
        </Typography>
        <Box sx={{ display: "flex", mt: 2 }}>
          {topColors.map((color) => (
            <Box
              key={color}
              sx={{
                width: 40,
                height: 40,
                bgcolor: color,
                border: "1px solid #ccc",
                mr: 1,
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
