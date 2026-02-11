import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

/**
 * SceneGalleryGrid
 *
 * Responsive grid displaying all scene thumbnails with filtering and sorting.
 */
export default function SceneGalleryGrid({ baseUrl, sceneCount = 155 }) {
  const [selectedScene, setSelectedScene] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("number");
  const [filterDuration, setFilterDuration] = useState("all");

  // Generate scenes
  const scenes = useMemo(() => {
    return Array.from({ length: sceneCount }, (_, i) => {
      const sceneNum = String(i + 1).padStart(3, "0");
      // Placeholder duration - would use actual data
      const duration = Math.random() * 30 + 1;
      return {
        number: i + 1,
        id: sceneNum,
        thumbnail1: `${baseUrl}/meheleparim-Scene-${sceneNum}-01.jpg`,
        thumbnail2: `${baseUrl}/meheleparim-Scene-${sceneNum}-02.jpg`,
        thumbnail3: `${baseUrl}/meheleparim-Scene-${sceneNum}-03.jpg`,
        video: `${baseUrl}/meheleparim-Scene-${sceneNum}.mp4`,
        duration: duration,
        timecode: `00:${String(Math.floor(i / 2)).padStart(2, "0")}:${String(
          (i % 60) * 2
        ).padStart(2, "0")}`,
      };
    });
  }, [baseUrl, sceneCount]);

  // Filter and sort
  const filteredScenes = useMemo(() => {
    let filtered = scenes;

    // Filter by duration
    if (filterDuration === "short") {
      filtered = filtered.filter((s) => s.duration < 5);
    } else if (filterDuration === "medium") {
      filtered = filtered.filter((s) => s.duration >= 5 && s.duration < 15);
    } else if (filterDuration === "long") {
      filtered = filtered.filter((s) => s.duration >= 15);
    }

    // Sort
    if (sortBy === "duration-asc") {
      filtered = [...filtered].sort((a, b) => a.duration - b.duration);
    } else if (sortBy === "duration-desc") {
      filtered = [...filtered].sort((a, b) => b.duration - a.duration);
    }

    return filtered;
  }, [scenes, filterDuration, sortBy]);

  const handleSceneClick = (scene) => {
    setSelectedScene(scene);
    setModalOpen(true);
  };

  return (
    <>
      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Scene Gallery
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
          <TextField
            select
            label="Filter by Duration"
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Scenes</MenuItem>
            <MenuItem value="short">Short (&lt; 5s)</MenuItem>
            <MenuItem value="medium">Medium (5-15s)</MenuItem>
            <MenuItem value="long">Long (&gt; 15s)</MenuItem>
          </TextField>

          <TextField
            select
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="number">Scene Number</MenuItem>
            <MenuItem value="duration-asc">Duration (Low to High)</MenuItem>
            <MenuItem value="duration-desc">Duration (High to Low)</MenuItem>
          </TextField>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto", alignSelf: "center" }}
          >
            Showing {filteredScenes.length} of {sceneCount} scenes
          </Typography>
        </Box>

        {/* Grid */}
        <Grid container spacing={2}>
          {filteredScenes.map((scene) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={scene.id}>
              <Card>
                <CardActionArea onClick={() => handleSceneClick(scene)}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={scene.thumbnail2}
                    alt={`Scene ${scene.number}`}
                    sx={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" display="block">
                      Scene {scene.number}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {scene.timecode}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {scene.duration.toFixed(1)}s
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Detail Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Scene {selectedScene?.number} - {selectedScene?.timecode}
        </DialogTitle>
        <DialogContent>
          {selectedScene && (
            <Box>
              <video
                controls
                autoPlay
                style={{ width: "100%", maxHeight: "400px", marginBottom: 16 }}
                src={selectedScene.video}
              >
                Your browser does not support video playback.
              </video>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Scene Thumbnails
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {[
                  selectedScene.thumbnail1,
                  selectedScene.thumbnail2,
                  selectedScene.thumbnail3,
                ].map((thumb, idx) => (
                  <img
                    key={idx}
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: "32%", borderRadius: 4 }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Duration:</strong> {selectedScene.duration.toFixed(2)}
                  s
                </Typography>
                <Typography variant="body2">
                  <strong>Timecode:</strong> {selectedScene.timecode}
                </Typography>
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
