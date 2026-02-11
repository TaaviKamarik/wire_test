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

function getPlacementCounts(scenes) {
  const counts = { indoor: 0, outdoor: 0, other: 0 };
  scenes.forEach((s) => {
    const p = (s.placement || "other").toLowerCase();
    if (p === "indoor" || p === "outdoor") counts[p]++;
    else counts.other++;
  });
  return counts;
}

export default function PlacementBarChart({ scenes }) {
  const counts = getPlacementCounts(scenes);
  const data = {
    labels: ["Indoor", "Outdoor", "Other"],
    datasets: [
      {
        label: "Count",
        data: [counts.indoor, counts.outdoor, counts.other],
        backgroundColor: ["#00b1bf", "#E32636", "#888"],
      },
    ],
  };
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Placement (Indoor vs Outdoor)
        </Typography>
        <Bar
          data={data}
          options={{ plugins: { legend: { display: false } } }}
        />
      </CardContent>
    </Card>
  );
}
