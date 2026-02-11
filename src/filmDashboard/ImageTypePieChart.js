import React from "react";
import { Pie } from "react-chartjs-2";
import { Card, CardContent, Typography } from "@mui/material";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

function getImageTypeCounts(scenes) {
  const counts = {};
  scenes.forEach((s) => {
    const type = (s.imagetype || "not clear").toLowerCase();
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}

export default function ImageTypePieChart({ scenes }) {
  const counts = getImageTypeCounts(scenes);
  const data = {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: ["#00b1bf", "#7CB9E8", "#E32636", "#888", "#FFD700"],
      },
    ],
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Share of Image Type
        </Typography>
        <Pie data={data} />
      </CardContent>
    </Card>
  );
}
