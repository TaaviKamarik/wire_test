import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Card,
  CardMedia,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

/**
 * VideoScenePlayer
 *
 * Interactive player with scene navigation.
 */
export default function VideoScenePlayer({ baseUrl, sceneCount = 155 }) {
  const [currentScene, setCurrentScene] = useState(1);

  const sceneId = String(currentScene).padStart(3, "0");
  const videoUrl = `${baseUrl}/meheleparim-Scene-${sceneId}.mp4`;
  const thumbnails = [
    `${baseUrl}/meheleparim-Scene-${sceneId}-01.jpg`,
    `${baseUrl}/meheleparim-Scene-${sceneId}-02.jpg`,
    `${baseUrl}/meheleparim-Scene-${sceneId}-03.jpg`,
  ];

  const goToPrevious = () => {
    if (currentScene > 1) setCurrentScene(currentScene - 1);
  };

  const goToNext = () => {
    if (currentScene < sceneCount) setCurrentScene(currentScene + 1);
  };

  // Get adjacent scene thumbnails for context
  const getPrevSceneThumb = () => {
    if (currentScene === 1) return null;
    const prevId = String(currentScene - 1).padStart(3, "0");
    return `${baseUrl}/meheleparim-Scene-${prevId}-02.jpg`;
  };

  const getNextSceneThumb = () => {
    if (currentScene === sceneCount) return null;
    const nextId = String(currentScene + 1).padStart(3, "0");
    return `${baseUrl}/meheleparim-Scene-${nextId}-02.jpg`;
  };

  return (
    <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Scene Player
      </Typography>

      {/* Main video player */}
      <Box
        sx={{ position: "relative", bgcolor: "black", borderRadius: 1, mb: 2 }}
      >
        <video
          key={videoUrl}
          controls
          autoPlay
          style={{ width: "100%", maxHeight: "500px", display: "block" }}
          src={videoUrl}
        >
          Your browser does not support video playback.
        </video>
      </Box>

      {/* Scene info */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">
          Scene {currentScene} of {sceneCount}
        </Typography>
        <Box>
          <IconButton
            onClick={goToPrevious}
            disabled={currentScene === 1}
            color="primary"
          >
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton
            onClick={goToNext}
            disabled={currentScene === sceneCount}
            color="primary"
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Current scene thumbnails */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Current Scene Frames
      </Typography>
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {thumbnails.map((thumb, idx) => (
          <Grid item xs={4} key={idx}>
            <Card>
              <CardMedia
                component="img"
                height="100"
                image={thumb}
                alt={`Frame ${idx + 1}`}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Adjacent scenes context */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Scene Context
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {/* Previous scene */}
        <Box sx={{ flex: 1, textAlign: "center" }}>
          {getPrevSceneThumb() ? (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                Previous: Scene {currentScene - 1}
              </Typography>
              <Card
                onClick={goToPrevious}
                sx={{
                  cursor: "pointer",
                  opacity: 0.7,
                  "&:hover": { opacity: 1 },
                }}
              >
                <CardMedia
                  component="img"
                  height="80"
                  image={getPrevSceneThumb()}
                  alt={`Scene ${currentScene - 1}`}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </Card>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              (Start of film)
            </Typography>
          )}
        </Box>

        {/* Current indicator */}
        <Box sx={{ width: 60, textAlign: "center" }}>
          <Typography variant="h4" color="primary">
            {currentScene}
          </Typography>
          <Typography variant="caption">Current</Typography>
        </Box>

        {/* Next scene */}
        <Box sx={{ flex: 1, textAlign: "center" }}>
          {getNextSceneThumb() ? (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                Next: Scene {currentScene + 1}
              </Typography>
              <Card
                onClick={goToNext}
                sx={{
                  cursor: "pointer",
                  opacity: 0.7,
                  "&:hover": { opacity: 1 },
                }}
              >
                <CardMedia
                  component="img"
                  height="80"
                  image={getNextSceneThumb()}
                  alt={`Scene ${currentScene + 1}`}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </Card>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              (End of film)
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
