import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";

/**
 * SceneTimelineNavigator
 *
 * Horizontal scrollable timeline showing all scenes with thumbnails.
 * Click to view scene video in modal.
 */
export default function SceneTimelineNavigator({ baseUrl, sceneCount = 155 }) {
  const [selectedScene, setSelectedScene] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const timelineRef = useRef(null);

  // Parse scene timing data (would ideally come from the .txt file)
  // For now using scene numbers 1-155
  const scenes = Array.from({ length: sceneCount }, (_, i) => {
    const sceneNum = String(i + 1).padStart(3, "0");
    return {
      number: i + 1,
      id: sceneNum,
      thumbnail: `${baseUrl}/meheleparim-Scene-${sceneNum}-02.jpg`,
      video: `${baseUrl}/meheleparim-Scene-${sceneNum}.mp4`,
    };
  });

  // Get scene length category for color coding
  const getSceneColor = (sceneNum) => {
    // This is placeholder - would use actual duration data
    if (sceneNum % 3 === 0) return "#4caf50"; // Long scenes
    if (sceneNum % 2 === 0) return "#ff9800"; // Medium scenes
    return "#2196f3"; // Short scenes
  };

  const handleSceneClick = (scene) => {
    setSelectedScene(scene);
    setModalOpen(true);
  };

  return (
    <>
      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Scene Timeline Navigator
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Scroll horizontally to navigate {sceneCount} scenes. Click to view
          video.
        </Typography>

        <Box
          ref={timelineRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 1,
            pb: 2,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 4,
            },
          }}
        >
          {scenes.map((scene) => (
            <Tooltip
              key={scene.id}
              title={`Scene ${scene.number}`}
              placement="top"
            >
              <Box
                onClick={() => handleSceneClick(scene)}
                sx={{
                  minWidth: 120,
                  cursor: "pointer",
                  position: "relative",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={scene.thumbnail}
                  alt={`Scene ${scene.number}`}
                  sx={{
                    width: 120,
                    height: 68,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: 2,
                    borderColor: getSceneColor(scene.number),
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                    px: 0.5,
                    borderRadius: 0.5,
                    fontSize: "0.7rem",
                  }}
                >
                  {scene.number}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Timeline progress bar */}
        <Box sx={{ mt: 2, height: 4, bgcolor: "grey.200", borderRadius: 1 }}>
          <Box
            sx={{
              height: "100%",
              width: "100%",
              background: "linear-gradient(90deg, #2196f3, #4caf50)",
              borderRadius: 1,
            }}
          />
        </Box>
      </Paper>

      {/* Video Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Scene {selectedScene?.number}</DialogTitle>
        <DialogContent>
          {selectedScene && (
            <Box sx={{ width: "100%", mt: 1 }}>
              <video
                controls
                autoPlay
                style={{ width: "100%", maxHeight: "500px" }}
                src={selectedScene.video}
              >
                Your browser does not support video playback.
              </video>
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <img
                  src={selectedScene.thumbnail}
                  alt="Scene thumbnail"
                  style={{ width: "30%", borderRadius: 4 }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
