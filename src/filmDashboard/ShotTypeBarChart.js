import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, Typography } from "@mui/material";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function getShotTypeCounts(scenes) {
  const counts = {};
  scenes.forEach((s) => {
    const type = (s.shot_type || "not clear").toLowerCase();
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}

export default function ShotTypeBarChart({ scenes }) {
  const counts = getShotTypeCounts(scenes);
  const data = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Shot Count",
        data: Object.values(counts),
        backgroundColor: "#00b1bf",
      },
    ],
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Shot Count by Shot Type
        </Typography>
        <Bar
          data={data}
          options={{ plugins: { legend: { display: false } } }}
        />
      </CardContent>
    </Card>
  );
}
