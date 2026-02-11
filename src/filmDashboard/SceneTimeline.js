import React from "react";
import { Box, Typography, Tooltip, Avatar } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import HomeIcon from "@mui/icons-material/Home";
import LandscapeIcon from "@mui/icons-material/Landscape";

// Extended shot types and color mapping
const shotTypeColors = {
  wide: "#7CB9E8",
  long: "#FFD700",
  medium: "#00b1bf",
  "medium close-up": "#00b1bf",
  "close-up": "#E32636",
  "extreme close-up": "#E32636",
  "not clear": "#888",
};
const shotTypeLabels = [
  "wide",
  "long",
  "medium",
  "medium close-up",
  "close-up",
  "extreme close-up",
  "not clear",
];

function getShotTypeColor(type) {
  if (!type) return shotTypeColors["not clear"];
  const key = type.toLowerCase();
  return shotTypeColors[key] || shotTypeColors["not clear"];
}

function getPlacementIcon(placement) {
  if (!placement) return null;
  const p = placement.toLowerCase();
  if (p === "indoor")
    return <HomeIcon fontSize="small" titleAccess="Indoor" sx={{ ml: 0.5 }} />;
  if (p === "outdoor")
    return (
      <LandscapeIcon fontSize="small" titleAccess="Outdoor" sx={{ ml: 0.5 }} />
    );
  if (p === "not clear")
    return (
      <span title="Placement not clear" style={{ fontSize: 16, marginLeft: 4 }}>
        ?
      </span>
    );
  return (
    <span
      title={`Placement: ${placement}`}
      style={{ fontSize: 16, marginLeft: 4 }}
    >
      ?
    </span>
  );
}

function getDaytimeIcon(daytime) {
  if (!daytime) return null;
  const d = daytime.toLowerCase();
  if (d === "day")
    return <WbSunnyIcon fontSize="small" titleAccess="Day" sx={{ ml: 0.5 }} />;
  if (d === "night")
    return (
      <NightlightIcon fontSize="small" titleAccess="Night" sx={{ ml: 0.5 }} />
    );
  if (d === "morning")
    return (
      <span title="Morning" style={{ fontSize: 16, marginLeft: 4 }}>
        🌅
      </span>
    );
  if (d === "evening")
    return (
      <span title="Evening" style={{ fontSize: 16, marginLeft: 4 }}>
        🌇
      </span>
    );
  if (d === "not clear")
    return (
      <span title="Daytime not clear" style={{ fontSize: 16, marginLeft: 4 }}>
        ?
      </span>
    );
  return (
    <span title={`Daytime: ${daytime}`} style={{ fontSize: 16, marginLeft: 4 }}>
      ?
    </span>
  );
}

export default function SceneTimeline({ scenes, imageBaseUrl }) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const scrollRef = React.useRef(null);
  const scrollInterval = React.useRef(null);

  // Scroll helpers
  const startScroll = (direction) => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += direction * 5;
      }
    }, 16);
  };
  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };
  const clickScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction * 120;
    }
  };

  React.useEffect(() => () => stopScroll(), []);

  return (
    <Box sx={{ width: "100%", position: "relative", py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Scene-by-Scene Timeline
      </Typography>
      {/* Scroll zones */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 48,
          width: 32,
          zIndex: 10,
          cursor: "w-resize",
          opacity: 0.01,
        }}
        onMouseEnter={() => startScroll(-1)}
        onMouseLeave={stopScroll}
        onMouseDown={() => clickScroll(-1)}
      />
      <Box
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 48,
          width: 32,
          zIndex: 10,
          cursor: "e-resize",
          opacity: 0.01,
        }}
        onMouseEnter={() => startScroll(1)}
        onMouseLeave={stopScroll}
        onMouseDown={() => clickScroll(1)}
      />
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          minHeight: 120,
          pl: 2,
          pr: 2,
          overflowX: "auto",
          scrollBehavior: "auto",
        }}
      >
        {scenes.map((scene, idx) => {
          const color = getShotTypeColor(scene.shot_type);
          const placementIcon = getPlacementIcon(scene.placement);
          const daytimeIcon = getDaytimeIcon(scene.daytime);
          const thumbUrl =
            scene.filecode && imageBaseUrl
              ? `${imageBaseUrl}${scene.filecode}.jpg`
              : null;

          // Wave effect: hovered, adjacent, and next-adjacent
          let width = 90,
            height = 56,
            zIndex = 1,
            boxShadow = 1;
          if (hoveredIdx === idx) {
            width = 140;
            height = 90;
            zIndex = 3;
            boxShadow = 6;
          } else if (hoveredIdx === idx - 1 || hoveredIdx === idx + 1) {
            width = 110;
            height = 70;
            zIndex = 2;
            boxShadow = 3;
          } else if (hoveredIdx === idx - 2 || hoveredIdx === idx + 2) {
            width = 100;
            height = 62;
            zIndex = 2;
            boxShadow = 2;
          }

          return (
            <Tooltip
              key={scene.filecode || idx}
              title={
                <Box sx={{ p: 1, minHeight: 200 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {scene.explanation || "No explanation"}
                  </Typography>
                  <Typography variant="caption">
                    Shot type: {scene.shot_type || "?"}
                    <br />
                    Placement: {scene.placement || "?"}
                    <br />
                    Daytime: {scene.daytime || "?"}
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  mx: 0,
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {thumbUrl ? (
                  <Avatar
                    variant="square"
                    src={thumbUrl}
                    alt={scene.filecode}
                    sx={{
                      height,
                      width,
                      mb: 0.5,
                      backgroundColor: color,
                      transition: "all 0.32s cubic-bezier(.22,1,.36,1)",
                      zIndex,
                      boxShadow,
                      position: "relative",
                      borderBottom: `4px solid ${color}`,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width,
                      height,
                      mb: 0.5,
                      bgcolor: color,
                      borderRadius: 1,
                      transition: "all 0.32s cubic-bezier(.22,1,.36,1)",
                      zIndex,
                      boxShadow,
                      position: "relative",
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
