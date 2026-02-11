import React, { useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";

/**
 * KeywordCooccurrenceNetwork
 *
 * Props:
 *   scenes: Array<{ keywords: string[] }>
 *
 * Builds a force-directed graph where:
 *   - Nodes: unique keywords
 *   - Edges: co-occurrence frequency (thicker = more frequent)
 *
 * Purpose: Reveal semantic clusters in the film.
 */
export default function KeywordCooccurrenceNetwork({ scenes, imageBaseUrl }) {
  // Build co-occurrence map
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { nodes, links } = useMemo(() => {
    const keywordSet = new Set();
    const edgeMap = new Map();

    scenes.forEach((scene) => {
      if (!Array.isArray(scene.keywords)) return;
      // Unique keywords per scene
      const kws = Array.from(
        new Set(scene.keywords.map((k) => k.trim()).filter(Boolean))
      );
      kws.forEach((kw) => keywordSet.add(kw));
      // All pairs (unordered)
      for (let i = 0; i < kws.length; i++) {
        for (let j = i + 1; j < kws.length; j++) {
          const [a, b] = kws[i] < kws[j] ? [kws[i], kws[j]] : [kws[j], kws[i]];
          const key = `${a}|||${b}`;

          // Get or create entry with scene list
          if (!edgeMap.has(key)) {
            edgeMap.set(key, { count: 0, scenes: [] });
          }
          const entry = edgeMap.get(key);
          entry.count += 1;
          entry.scenes.push(scene);
        }
      }
    });

    // Build nodes/links arrays
    const nodes = Array.from(keywordSet).map((id) => ({ id }));
    const links = Array.from(edgeMap.entries()).map(
      ([key, { count, scenes: linkScenes }]) => {
        const [source, target] = key.split("|||");
        return {
          id: key, // Use the alphabetically sorted key as the link id
          source,
          target,
          value: count,
          scenes: linkScenes, // Attach scenes directly to the link
        };
      }
    );

    console.log("=== GRAPH DATA VERIFICATION ===");
    console.log("Total nodes:", nodes.length);
    console.log("Total links:", links.length);
    console.log("\nSample nodes (first 5):", nodes.slice(0, 5));
    console.log("\nSample links (first 5):");
    links.slice(0, 5).forEach((link, idx) => {
      console.log(`Link ${idx + 1}:`, {
        id: link.id,
        source: link.source,
        target: link.target,
        value: link.value,
        sceneCount: link.scenes.length,
        sourceExists: nodes.some((n) => n.id === link.source),
        targetExists: nodes.some((n) => n.id === link.target),
      });
    });
    console.log("\nChecking if all link sources/targets exist as nodes...");
    const orphanedLinks = links.filter(
      (link) =>
        !nodes.some((n) => n.id === link.source) ||
        !nodes.some((n) => n.id === link.target)
    );
    console.log("Orphaned links (should be 0):", orphanedLinks.length);
    if (orphanedLinks.length > 0) {
      console.warn("Found orphaned links:", orphanedLinks.slice(0, 3));
    }
    console.log("===============================\n");

    return { nodes, links };
  }, [scenes]);

  return (
    <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Keyword Co-occurrence Network
      </Typography>
      <Box
        sx={{
          width: 1,
          minWidth: 320,
          maxWidth: 1200,
          height: 500,
          mx: "auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ForceGraph2D
          width={1200}
          height={500}
          graphData={{ nodes, links }}
          nodeLabel={(node) => node.id}
          nodeAutoColorBy="id"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = node.color || "#333";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          linkWidth={(link) => Math.max(1, Math.log(link.value + 1))}
          linkColor={() => "rgba(0,0,0,0.15)"}
          cooldownTicks={100}
          onEngineStop={() => {}}
          onLinkClick={(link) => {
            console.log("=== LINK CLICKED ===");
            console.log("Full link object:", link);
            console.log("link.id:", link.id);
            console.log("link.source:", link.source);
            console.log("link.target:", link.target);
            console.log("link.value:", link.value);
            console.log("link.scenes:", link.scenes);
            console.log("Has scenes?", !!link.scenes);
            console.log("Scene count:", link.scenes?.length);
            console.log("===================\n");

            setModalData({
              id: link.id, // Use the link id directly
              scenes: link.scenes || [], // Use scenes from the link object
            });
            setModalOpen(true);
          }}
          enableNodeDrag={false}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Nodes: keywords. Edges: co-appearance frequency. Layout: force-directed.
        Click on edges to see scenes.
      </Typography>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Scenes with keywords: {modalData?.id?.replace("|||", " & ")}
        </DialogTitle>
        <DialogContent dividers>
          {modalData?.scenes?.length ? (
            <Grid container spacing={2}>
              {modalData.scenes.map((scene, idx) => {
                const thumbUrl =
                  scene.filecode && imageBaseUrl
                    ? `${imageBaseUrl}${scene.filecode}.jpg`
                    : null;
                return (
                  <Grid item xs={12} key={scene.filecode || idx}>
                    <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Scene: {scene.filecode || `#${idx + 1}`}
                      </Typography>

                      {thumbUrl && (
                        <Box sx={{ mb: 2, textAlign: "center" }}>
                          <img
                            src={thumbUrl}
                            alt={scene.filecode}
                            style={{
                              width: "100%",
                              maxWidth: 400,
                              borderRadius: 8,
                              border: "1px solid #ddd",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </Box>
                      )}

                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        <strong>Explanation:</strong>{" "}
                        {scene.explanation || "No explanation available"}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Shot Type:</strong> {scene.shot_type || "?"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Placement:</strong> {scene.placement || "?"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Daytime:</strong> {scene.daytime || "?"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Image Type:</strong>{" "}
                            {scene.imagetype || "?"}
                          </Typography>
                        </Grid>
                      </Grid>

                      {scene.actions && scene.actions.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Actions:</strong> {scene.actions.join(", ")}
                          </Typography>
                        </Box>
                      )}

                      {scene.objects && scene.objects.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Objects:</strong> {scene.objects.join(", ")}
                          </Typography>
                        </Box>
                      )}

                      {scene.persons && scene.persons.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Persons:</strong> {scene.persons.join(", ")}
                          </Typography>
                        </Box>
                      )}

                      {scene.colorcodes && scene.colorcodes.length > 0 && (
                        <Box
                          sx={{
                            mt: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            <strong>Color Palette:</strong>
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {scene.colorcodes.slice(0, 5).map((color, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: color,
                                  border: "1px solid #ccc",
                                  borderRadius: 0.5,
                                }}
                                title={color}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No scenes found where both keywords appear together.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
