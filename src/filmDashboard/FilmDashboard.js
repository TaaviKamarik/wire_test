import React from "react";
import ShotTypeBarChart from "./ShotTypeBarChart";
import ImageTypePieChart from "./ImageTypePieChart";
import PlacementBarChart from "./PlacementBarChart";
import ColorPaletteStrip from "./ColorPaletteStrip";
import WordCloudChart from "./WordCloudChart";
import { Box, Typography, Paper, Grid } from "@mui/material";
import SceneTimeline from "./SceneTimeline";
import DominantColorHeatmapNivo from "./DominantColorHeatmapNivo";
import KeywordCooccurrenceNetwork from "./KeywordCooccurrenceNetwork";
import SceneTimelineNavigator from "./SceneTimelineNavigator";
import SceneGalleryGrid from "./SceneGalleryGrid";
import VideoScenePlayer from "./VideoScenePlayer";
import SceneDurationCharts from "./SceneDurationCharts";
import SceneComparisonView from "./SceneComparisonView";
import SceneSimilarityNetwork from "./SceneSimilarityNetwork";
import SceneConstellationGraph from "./SceneConstellationGraph";

/**
 * FilmDashboard
 * Props:
 *   filmMeta: { id, title, ... }
 *   scenes: array of scene objects (from kirjeldused.json)
 *   imageBaseUrl: base url for scene images (ends with /)
 */
export default function FilmDashboard({ filmMeta, scenes, imageBaseUrl }) {
  const baseUrl =
    "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/stseenid/meheleparim";
  const sceneCount = 155;

  return (
    <Box display="flex" justifyContent="center" width="100%" mt={4}>
      <Paper
        sx={{
          p: { xs: 1, sm: 2, md: 4 },
          mb: 4,
          maxWidth: 1200,
          width: "100%",
        }}
        elevation={3}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          {filmMeta?.title || "Film Dashboard"}
        </Typography>

        {/* Dominant color palette heatmap using Nivo */}
        <DominantColorHeatmapNivo scenes={scenes} />

        {/* Scene-by-scene timeline visualization */}
        <SceneTimeline scenes={scenes} imageBaseUrl={imageBaseUrl} />

        {/* Keyword co-occurrence network */}
        <KeywordCooccurrenceNetwork
          scenes={scenes}
          imageBaseUrl={imageBaseUrl}
        />

        {/* Scene Similarity Network - network graph showing similar scenes */}
        <SceneSimilarityNetwork />

        {/* Scene Constellation Graph - interactive force-directed network */}
        <SceneConstellationGraph />

        {/* Scene Timeline Navigator - horizontal scrollable timeline */}
        <SceneTimelineNavigator baseUrl={baseUrl} sceneCount={sceneCount} />

        {/* Video Scene Player - player with navigation */}
        <VideoScenePlayer baseUrl={baseUrl} sceneCount={sceneCount} />

        {/* Scene Gallery Grid - filterable/sortable grid */}
        <SceneGalleryGrid baseUrl={baseUrl} sceneCount={sceneCount} />

        {/* Scene Duration Charts - statistical visualizations */}
        <SceneDurationCharts sceneCount={sceneCount} />

        {/* Scene Comparison View - side-by-side comparison */}
        <SceneComparisonView baseUrl={baseUrl} sceneCount={sceneCount} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box height={{ xs: 300, md: 350 }}>
              <ShotTypeBarChart scenes={scenes} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box height={{ xs: 300, md: 350 }}>
              <ImageTypePieChart scenes={scenes} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box height={{ xs: 300, md: 350 }}>
              <PlacementBarChart scenes={scenes} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box height={{ xs: 300, md: 350 }}>
              <ColorPaletteStrip scenes={scenes} imageBaseUrl={imageBaseUrl} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box height={{ xs: 300, md: 350 }}>
              <WordCloudChart scenes={scenes} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
