import React, { useMemo } from "react";
import { Typography, Paper, Grid } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

/**
 * SceneDurationCharts
 *
 * Visualizations of scene duration data.
 */
export default function SceneDurationCharts({ sceneCount = 155 }) {
  // Generate placeholder scene data (would use real timing data)
  const sceneData = useMemo(() => {
    return Array.from({ length: sceneCount }, (_, i) => {
      const duration = Math.random() * 30 + 0.5; // Random duration 0.5-30s
      return {
        number: i + 1,
        duration: parseFloat(duration.toFixed(2)),
        timestamp: i * 6, // Approximate cumulative time
      };
    });
  }, [sceneCount]);

  // Duration buckets for pie chart
  const durationBuckets = useMemo(() => {
    const buckets = {
      "< 2s": 0,
      "2-5s": 0,
      "5-10s": 0,
      "10-20s": 0,
      "> 20s": 0,
    };

    sceneData.forEach((scene) => {
      if (scene.duration < 2) buckets["< 2s"]++;
      else if (scene.duration < 5) buckets["2-5s"]++;
      else if (scene.duration < 10) buckets["5-10s"]++;
      else if (scene.duration < 20) buckets["10-20s"]++;
      else buckets["> 20s"]++;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [sceneData]);

  // Bar chart data - group scenes by 10s
  const barChartData = useMemo(() => {
    const groups = {};
    sceneData.forEach((scene) => {
      const group = Math.floor(scene.number / 10) * 10;
      const key = `${group + 1}-${group + 10}`;
      if (!groups[key]) {
        groups[key] = { name: key, avgDuration: 0, count: 0, total: 0 };
      }
      groups[key].total += scene.duration;
      groups[key].count++;
    });

    return Object.values(groups).map((g) => ({
      name: g.name,
      avgDuration: parseFloat((g.total / g.count).toFixed(2)),
    }));
  }, [sceneData]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Scene Duration Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Bar Chart - Average duration by scene groups */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Average Scene Duration (by scene groups)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis
                label={{
                  value: "Duration (s)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avgDuration"
                fill="#8884d8"
                name="Avg Duration (s)"
              />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        {/* Pie Chart - Duration distribution */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Scene Duration Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={durationBuckets}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {durationBuckets.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        {/* Scatter Plot - Scene number vs duration */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Scene Duration Over Film Progression
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="number"
                name="Scene #"
                label={{
                  value: "Scene Number",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                type="number"
                dataKey="duration"
                name="Duration"
                label={{
                  value: "Duration (s)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter name="Scenes" data={sceneData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </Grid>

        {/* Statistics summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Total Scenes
                </Typography>
                <Typography variant="h6">{sceneCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Avg Duration
                </Typography>
                <Typography variant="h6">
                  {(
                    sceneData.reduce((sum, s) => sum + s.duration, 0) /
                    sceneCount
                  ).toFixed(2)}
                  s
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Shortest Scene
                </Typography>
                <Typography variant="h6">
                  {Math.min(...sceneData.map((s) => s.duration)).toFixed(2)}s
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Longest Scene
                </Typography>
                <Typography variant="h6">
                  {Math.max(...sceneData.map((s) => s.duration)).toFixed(2)}s
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
