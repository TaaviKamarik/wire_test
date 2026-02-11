import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from "@mui/material";

/**
 * SceneComparisonView
 *
 * Side-by-side comparison of multiple scenes.
 */
export default function SceneComparisonView({ baseUrl, sceneCount = 155 }) {
  const [scene1, setScene1] = useState(1);
  const [scene2, setScene2] = useState(10);
  const [scene3, setScene3] = useState(null); // Optional third scene

  const getSceneData = (sceneNum) => {
    if (!sceneNum || sceneNum < 1 || sceneNum > sceneCount) return null;
    const sceneId = String(sceneNum).padStart(3, "0");
    // Placeholder duration
    const duration = (Math.random() * 20 + 1).toFixed(2);
    return {
      number: sceneNum,
      id: sceneId,
      video: `${baseUrl}/meheleparim-Scene-${sceneId}.mp4`,
      thumbnails: [
        `${baseUrl}/meheleparim-Scene-${sceneId}-01.jpg`,
        `${baseUrl}/meheleparim-Scene-${sceneId}-02.jpg`,
        `${baseUrl}/meheleparim-Scene-${sceneId}-03.jpg`,
      ],
      duration: duration,
      timecode: `00:${String(Math.floor(sceneNum / 2)).padStart(
        2,
        "0"
      )}:${String((sceneNum % 60) * 2).padStart(2, "0")}`,
    };
  };

  const scenes = [scene1, scene2, scene3]
    .filter(Boolean)
    .map(getSceneData)
    .filter(Boolean);

  const SceneCard = ({ scene }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Scene {scene.number}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Timecode: {scene.timecode}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 2 }}
        >
          Duration: {scene.duration}s
        </Typography>

        {/* Video */}
        <video
          controls
          style={{ width: "100%", maxHeight: "200px", marginBottom: 16 }}
          src={scene.video}
        >
          Your browser does not support video playback.
        </video>

        {/* Thumbnails */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 1 }}
        >
          Key Frames
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {scene.thumbnails.map((thumb, idx) => (
            <CardMedia
              key={idx}
              component="img"
              image={thumb}
              alt={`Frame ${idx + 1}`}
              sx={{ width: "32%", borderRadius: 1 }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Scene Comparison
      </Typography>

      {/* Scene selectors */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          type="number"
          label="Scene 1"
          value={scene1}
          onChange={(e) => setScene1(parseInt(e.target.value) || 1)}
          size="small"
          inputProps={{ min: 1, max: sceneCount }}
          sx={{ width: 100 }}
        />
        <TextField
          type="number"
          label="Scene 2"
          value={scene2}
          onChange={(e) => setScene2(parseInt(e.target.value) || 1)}
          size="small"
          inputProps={{ min: 1, max: sceneCount }}
          sx={{ width: 100 }}
        />
        <TextField
          type="number"
          label="Scene 3 (optional)"
          value={scene3 || ""}
          onChange={(e) => setScene3(parseInt(e.target.value) || null)}
          size="small"
          inputProps={{ min: 1, max: sceneCount }}
          sx={{ width: 150 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setScene1(Math.floor(Math.random() * sceneCount) + 1);
            setScene2(Math.floor(Math.random() * sceneCount) + 1);
          }}
        >
          Random Scenes
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Comparison Grid */}
      <Grid container spacing={2}>
        {scenes.map((scene, idx) => (
          <Grid item xs={12} md={scenes.length === 2 ? 6 : 4} key={idx}>
            <SceneCard scene={scene} />
          </Grid>
        ))}
      </Grid>

      {/* Comparison metrics */}
      {scenes.length >= 2 && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" gutterBottom>
            Comparison Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Duration Difference
              </Typography>
              <Typography variant="body2">
                {Math.abs(
                  parseFloat(scenes[0].duration) -
                    parseFloat(scenes[1].duration)
                ).toFixed(2)}
                s
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Scene Gap
              </Typography>
              <Typography variant="body2">
                {Math.abs(scenes[0].number - scenes[1].number)} scenes apart
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Avg Duration
              </Typography>
              <Typography variant="body2">
                {(
                  scenes.reduce((sum, s) => sum + parseFloat(s.duration), 0) /
                  scenes.length
                ).toFixed(2)}
                s
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Paper>
  );
}
