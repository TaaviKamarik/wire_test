import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  Slider,
  Collapse,
  IconButton,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/**
 * SceneClusteringView
 *
 * Groups similar scenes based on their shared facets and visualizes them as clusters.
 * Helps identify patterns like "all indoor dialogue scenes" or "outdoor action sequences."
 */
export default function SceneClusteringView({
  dataUrl = "https://minitorn.tlu.ee/~jaagup/oma/too/25/09/all_movies.json",
}) {
  const [allMovies, setAllMovies] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clusteringMethod, setClusteringMethod] = useState("facet-combination");
  const [selectedFacet, setSelectedFacet] = useState("shot_type");
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);

  // Multi-facet clustering parameters
  const [includeShotType, setIncludeShotType] = useState(true);
  const [includePlacement, setIncludePlacement] = useState(true);
  const [includeDaytime, setIncludeDaytime] = useState(true);
  const [includeSeason, setIncludeSeason] = useState(false);
  const [includeImageType, setIncludeImageType] = useState(false);
  const [includeKeywords, setIncludeKeywords] = useState(true);
  const [keywordCount, setKeywordCount] = useState(2);
  const [includeActions, setIncludeActions] = useState(true);
  const [actionCount, setActionCount] = useState(1);
  const [includePersons, setIncludePersons] = useState(false);
  const [personCount, setPersonCount] = useState(1);
  const [includeObjects, setIncludeObjects] = useState(false);
  const [objectCount, setObjectCount] = useState(1);
  const [minClusterSize, setMinClusterSize] = useState(2);
  const [showParameters, setShowParameters] = useState(false);

  // Fetch data from the URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await response.json();
        const moviesArray = Array.isArray(jsonData)
          ? jsonData.slice(0, 10)
          : [jsonData];
        setAllMovies(moviesArray);
        setSelectedMovieIds(moviesArray.map((m) => m.film[0]));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl]);

  // Combine selected movies and add movie hash
  useEffect(() => {
    if (allMovies.length === 0) return;
    const combinedKaadrid = [];
    selectedMovieIds.forEach((movieId) => {
      const movie = allMovies.find((m) => m.film[0] === movieId);
      if (movie) {
        const videoHash = movie.film[4];
        movie.kaadrid.forEach((scene) => {
          let start = 0,
            end = 0;
          if (scene.ajad && typeof scene.ajad === "string") {
            [start, end] = scene.ajad.split(" ").map(Number);
          }
          combinedKaadrid.push({ ...scene, movieId, videoHash, start, end });
        });
      }
    });
    setData({ kaadrid: combinedKaadrid });
  }, [selectedMovieIds, allMovies]);

  // Single facet clustering options
  const singleFacetOptions = [
    { value: "shot_type", label: "Shot Type" },
    { value: "placement", label: "Placement" },
    { value: "imagetype", label: "Image Type" },
    { value: "season", label: "Season" },
    { value: "daytime", label: "Daytime" },
  ];

  // Calculate scene similarity and cluster them
  const clusters = useMemo(() => {
    if (!data || !data.kaadrid) return [];

    const scenes = data.kaadrid;

    if (clusteringMethod === "single-facet") {
      // Cluster by a single facet value
      const clusterMap = new Map();

      scenes.forEach((scene, idx) => {
        let facetValue = scene[selectedFacet];

        if (!facetValue || facetValue === "not clear") {
          facetValue = "Unknown";
        }

        if (!clusterMap.has(facetValue)) {
          clusterMap.set(facetValue, []);
        }

        clusterMap.get(facetValue).push({
          ...scene,
          sceneIndex: idx,
        });
      });

      return Array.from(clusterMap.entries())
        .map(([name, sceneList]) => ({
          name,
          scenes: sceneList,
          count: sceneList.length,
        }))
        .sort((a, b) => b.count - a.count);
    } else {
      // Cluster by common facet combinations
      const clusterMap = new Map();

      scenes.forEach((scene, idx) => {
        // Create a signature for this scene based on key facets
        const facets = [];

        // Add single-value facets based on toggles
        if (
          includeShotType &&
          scene.shot_type &&
          scene.shot_type !== "not clear"
        ) {
          facets.push(`Shot: ${scene.shot_type}`);
        }
        if (
          includePlacement &&
          scene.placement &&
          scene.placement !== "not clear"
        ) {
          facets.push(`Place: ${scene.placement}`);
        }
        if (includeDaytime && scene.daytime && scene.daytime !== "not clear") {
          facets.push(`Time: ${scene.daytime}`);
        }
        if (includeSeason && scene.season && scene.season !== "not clear") {
          facets.push(`Season: ${scene.season}`);
        }
        if (
          includeImageType &&
          scene.imagetype &&
          scene.imagetype !== "not clear"
        ) {
          facets.push(`Image: ${scene.imagetype}`);
        }

        // Add keywords if enabled
        if (
          includeKeywords &&
          scene.keywords &&
          Array.isArray(scene.keywords)
        ) {
          const topKeywords = scene.keywords.slice(0, keywordCount);
          topKeywords.forEach((kw) => {
            if (kw && kw.trim()) {
              facets.push(kw.toLowerCase());
            }
          });
        }

        // Add actions if enabled
        if (includeActions && scene.actions && Array.isArray(scene.actions)) {
          const topActions = scene.actions.slice(0, actionCount);
          topActions.forEach((action) => {
            if (action && action.trim()) {
              facets.push(`Action: ${action.toLowerCase()}`);
            }
          });
        }

        // Add persons if enabled
        if (includePersons && scene.persons && Array.isArray(scene.persons)) {
          const topPersons = scene.persons.slice(0, personCount);
          topPersons.forEach((person) => {
            if (person && person.trim()) {
              facets.push(`Person: ${person.toLowerCase()}`);
            }
          });
        }

        // Add objects if enabled
        if (includeObjects && scene.objects && Array.isArray(scene.objects)) {
          const topObjects = scene.objects.slice(0, objectCount);
          topObjects.forEach((obj) => {
            if (obj && obj.trim()) {
              facets.push(`Object: ${obj.toLowerCase()}`);
            }
          });
        }

        if (facets.length === 0) {
          facets.push("Uncategorized");
        }

        const signature = facets.sort().join(" • ");

        if (!clusterMap.has(signature)) {
          clusterMap.set(signature, []);
        }

        clusterMap.get(signature).push({
          ...scene,
          sceneIndex: idx,
        });
      });

      // Only keep clusters with minimum size
      return Array.from(clusterMap.entries())
        .map(([name, sceneList]) => ({
          name,
          scenes: sceneList,
          count: sceneList.length,
        }))
        .filter((cluster) => cluster.count >= minClusterSize)
        .sort((a, b) => b.count - a.count);
    }
  }, [
    data,
    clusteringMethod,
    selectedFacet,
    includeShotType,
    includePlacement,
    includeDaytime,
    includeSeason,
    includeImageType,
    includeKeywords,
    keywordCount,
    includeActions,
    actionCount,
    includePersons,
    personCount,
    includeObjects,
    objectCount,
    minClusterSize,
  ]);

  const handleClusterClick = (cluster) => {
    setSelectedCluster(cluster);
    setModalOpen(true);
  };

  // Get color for cluster based on size
  const getClusterColor = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio > 0.5) return "primary";
    if (ratio > 0.25) return "secondary";
    if (ratio > 0.1) return "info";
    return "default";
  };

  const maxCount = clusters.length > 0 ? clusters[0].count : 1;

  if (loading) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading scene data...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="error">Error loading data: {error}</Alert>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="info">No data available.</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Scene Clustering</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Scenes grouped by similar characteristics. Larger clusters indicate
        common patterns in the film.
      </Typography>

      {/* Clustering Method Controls */}
      <Box
        sx={{
          mt: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <ToggleButtonGroup
          value={clusteringMethod}
          exclusive
          onChange={(e, newMethod) => {
            if (newMethod) setClusteringMethod(newMethod);
          }}
          size="small"
        >
          <ToggleButton value="facet-combination">
            Multi-Facet Clustering
          </ToggleButton>
          <ToggleButton value="single-facet">Single Facet</ToggleButton>
        </ToggleButtonGroup>

        {clusteringMethod === "single-facet" && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Facet</InputLabel>
            <Select
              value={selectedFacet}
              label="Facet"
              onChange={(e) => setSelectedFacet(e.target.value)}
            >
              {singleFacetOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {clusteringMethod === "facet-combination" && (
          <Box>
            <IconButton
              size="small"
              onClick={() => setShowParameters(!showParameters)}
            >
              {showParameters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Typography
              variant="caption"
              sx={{ ml: 1, cursor: "pointer" }}
              onClick={() => setShowParameters(!showParameters)}
            >
              {showParameters ? "Hide" : "Show"} Parameters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Parameter Controls Panel */}
      <Collapse in={showParameters && clusteringMethod === "facet-combination"}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Clustering Parameters
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            Choose which facets to include in the clustering algorithm
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Single-value facets */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeShotType}
                    onChange={(e) => setIncludeShotType(e.target.checked)}
                  />
                }
                label="Shot Type"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePlacement}
                    onChange={(e) => setIncludePlacement(e.target.checked)}
                  />
                }
                label="Placement"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeDaytime}
                    onChange={(e) => setIncludeDaytime(e.target.checked)}
                  />
                }
                label="Daytime"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSeason}
                    onChange={(e) => setIncludeSeason(e.target.checked)}
                  />
                }
                label="Season"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeImageType}
                    onChange={(e) => setIncludeImageType(e.target.checked)}
                  />
                }
                label="Image Type"
              />
            </Grid>

            {/* Array facets with counts */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeKeywords}
                    onChange={(e) => setIncludeKeywords(e.target.checked)}
                  />
                }
                label="Keywords"
              />
              <Collapse in={includeKeywords}>
                <Box sx={{ px: 3, py: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    Number of keywords: {keywordCount}
                  </Typography>
                  <Slider
                    value={keywordCount}
                    onChange={(e, val) => setKeywordCount(val)}
                    min={1}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Collapse>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeActions}
                    onChange={(e) => setIncludeActions(e.target.checked)}
                  />
                }
                label="Actions"
              />
              <Collapse in={includeActions}>
                <Box sx={{ px: 3, py: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    Number of actions: {actionCount}
                  </Typography>
                  <Slider
                    value={actionCount}
                    onChange={(e, val) => setActionCount(val)}
                    min={1}
                    max={3}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Collapse>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePersons}
                    onChange={(e) => setIncludePersons(e.target.checked)}
                  />
                }
                label="Persons"
              />
              <Collapse in={includePersons}>
                <Box sx={{ px: 3, py: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    Number of persons: {personCount}
                  </Typography>
                  <Slider
                    value={personCount}
                    onChange={(e, val) => setPersonCount(val)}
                    min={1}
                    max={3}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Collapse>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeObjects}
                    onChange={(e) => setIncludeObjects(e.target.checked)}
                  />
                }
                label="Objects"
              />
              <Collapse in={includeObjects}>
                <Box sx={{ px: 3, py: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    Number of objects: {objectCount}
                  </Typography>
                  <Slider
                    value={objectCount}
                    onChange={(e, val) => setObjectCount(val)}
                    min={1}
                    max={3}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Collapse>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" gutterBottom display="block">
                Minimum cluster size: {minClusterSize}
              </Typography>
              <Slider
                value={minClusterSize}
                onChange={(e, val) => setMinClusterSize(val)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Cluster Cards */}
      {clusters.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No clusters found. Try adjusting the parameters or selecting different
          facets.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {clusters.map((cluster, idx) => (
            <Card
              key={idx}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleClusterClick(cluster)}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem", flex: 1, mr: 1 }}
                  >
                    {cluster.name}
                  </Typography>
                  <Chip
                    label={cluster.count}
                    color={getClusterColor(cluster.count, maxCount)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {cluster.count} scene{cluster.count !== 1 ? "s" : ""}
                </Typography>

                {/* Preview of scene numbers */}
                <Box
                  sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
                >
                  {cluster.scenes.slice(0, 8).map((scene, sIdx) => (
                    <Chip
                      key={sIdx}
                      label={scene.snr}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  ))}
                  {cluster.scenes.length > 8 && (
                    <Chip
                      label={`+${cluster.scenes.length - 8}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal for showing cluster details */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedCluster && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{selectedCluster.name}</Typography>
              <Chip label={`${selectedCluster.count} scenes`} color="primary" />
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedCluster && (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  mt: 2,
                }}
              >
                {selectedCluster.scenes.map((scene, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Scene {scene.snr}
                      {scene.ajad && scene.ajad.length === 2 && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({Math.floor(scene.ajad[0] / 60)}:
                          {(scene.ajad[0] % 60).toFixed(0).padStart(2, "0")} -{" "}
                          {Math.floor(scene.ajad[1] / 60)}:
                          {(scene.ajad[1] % 60).toFixed(0).padStart(2, "0")})
                        </Typography>
                      )}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {scene.explanation}
                    </Typography>

                    {/* Facet details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {scene.shot_type && scene.shot_type !== "not clear" && (
                        <Chip
                          label={scene.shot_type}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {scene.placement && scene.placement !== "not clear" && (
                        <Chip
                          label={scene.placement}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {scene.daytime && scene.daytime !== "not clear" && (
                        <Chip
                          label={scene.daytime}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Video Player */}
                    <Box sx={{ mt: 2 }}>
                      <video
                        controls
                        style={{
                          width: "100%",
                          borderRadius: "4px",
                          backgroundColor: "#000",
                          maxHeight: "200px",
                        }}
                      >
                        <source
                          src={`https://cdn.efis.ee/is/EfisFilms/Video/${scene.movieId}/${scene.videoHash}#t=${scene.start},${scene.end}`}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
