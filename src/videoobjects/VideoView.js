import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Skeleton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LabelIcon from "@mui/icons-material/Label";

export default function VideoView({ data, setData, initialShape = null, cardNo, setCardNo }) {
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const overlayRef = useRef(null);

  const [dimensions, setDimensions] = useState({ x2: 889, y2: 500 });
  const [videoMeta, setVideoMeta] = useState(null);
  const [shapeData, setShapeData] = useState({});
  const [selectedShape, setSelectedShape] = useState(initialShape);
  const [highlightedPoints, setHighlightedPoints] = useState([]);
  const [bboxes, setBboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoBookmarks, setVideoBookmarks] = useState({});
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!data?.fig_meta00) return;

    const meta = data["fig_meta00"];
    const dims = JSON.parse(meta[0][1]);
    setDimensions(dims);

    setVideoMeta({
      title: meta[0][2][0][2],
      file: meta[0][2][0][0],
      folder: meta[0][2][0][1],
    });

    const filteredShapes = Object.fromEntries(
      Object.entries(data).filter(([key]) => key !== "fig_meta00")
    );
    setShapeData(filteredShapes);
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (!selectedShape || !shapeData[selectedShape]) return;

    const kestus = videoRef.current?.duration || 1;
    setDuration(kestus * 1000)
    const rings = shapeData[selectedShape].map(([ms, json]) => {
      const ak = JSON.parse(json);
      const sek = ms / 1000;
      return {
        cx: 10 + (sek / kestus) * dimensions.x2,
        cy: 70 - ak.prob * 70,
        sek,
        bbox: ak,
      };
    });


    if (rings.length > 0) {
      const highest = rings.reduce((a, b) => (a.cy < b.cy ? a : b));
      handleCircleClick(highest);
    }
  }, [selectedShape, shapeData]);

  const handleCircleClick = (ring) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = ring.sek;

    const time = ring.sek;
    const allAtTime = shapeData[selectedShape]
      .filter(([ms]) => ms / 1000 === time)
      .map(([, json]) => JSON.parse(json));

    handleSelectShape(selectedShape);
    setBboxes(allAtTime);
  };

  console.log(videoBookmarks)

  const onBack = () => {
    setCardNo(cardNo - 1);
    setData({});
  };

  const handleSelectShape = (shape) => {
    console.log(shape)
    setSelectedShape(shape);
    const timeList = {}
    shapeData[shape].forEach(([time, json]) => {
      if(!timeList[time]) {
        timeList[time] = []
      }

      timeList[time].push(json)
    });
    setVideoBookmarks(timeList)
  }

  const handleTagClick = (val) => {
    setBboxes(val[1].map((json) => JSON.parse(json)))
    videoRef.current.currentTime = parseInt(val[0]) / 1000
  }


  return (
    <Box sx={{ display: "flex", gap: "1rem", alignItems: "start", justifyContent: "center" }}>
      <Box sx={{ padding: "0.5rem" }}>
        <Button
          onClick={onBack}
          sx={{ background: "#00b1bf" }}
          startIcon={<ChevronLeftIcon />}
          variant="contained"
        >
          back
        </Button>
      </Box>

      {loading || !videoMeta ? (
        <>
          <Box sx={{ paddingBottom: "0.5rem" }}>
            <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
            <Skeleton variant="rounded" width={210} height={500} />
          </Box>
          <Box sx={{ paddingBottom: "0.5rem" }}>
            <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
            <Skeleton variant="rounded" width={889} height={500} />
          </Box>
        </>
      ) : (
        <>
          <Box>
            <div style={{ padding: "0.5rem" }} className="font-type navmenu-style">
              Keywords
            </div>
            <div style={{height: dimensions.y2}}>
              <Paper sx={{ padding: "0.5rem", marginBottom: "1rem", height: "4rem"}}>
                <Typography sx={{fontWeight: "bold"}}>Selected keyword:</Typography>
                <Typography variant="h6">
                  {selectedShape?.substring(4)}
                </Typography>
              </Paper>
              <Paper sx={{overflow: "auto", height: "calc(100% - 5rem)"}}>
                <List >
                  {Object.keys(shapeData)
                    .sort((a, b) => shapeData[b].length - shapeData[a].length)
                    .map((key) => {
                      const entries = shapeData[key];
                      const unique = new Set(entries.map(e => e[1]));
                      return (
                        <ListItem key={key}>
                          <ListItemText
                            className="video-list-item"
                            onClick={() => {
                              handleSelectShape(key)
                            }}
                            primary={`${key.replace("fig_", "")} (${unique.size})`}
                          />
                        </ListItem>
                      );
                    })}
                </List>
              </Paper>
            </div>

          </Box>

          <Box>
            <div style={{ padding: "0.5rem" }} className="font-type navmenu-style">
              {videoMeta.title}
            </div>
            <Box sx={{ position: "relative", width: dimensions.x2, height: dimensions.y2 }}>
              <video
                ref={videoRef}
                controls
                style={{ width: dimensions.x2, height: dimensions.y2, position: "relative", zIndex: 1 }}
              >
                <source
                  ref={sourceRef => {
                    if (sourceRef) {
                      sourceRef.src = `https://cdn.efis.ee/is/EfisFilms/Video/${videoMeta.folder}/${videoMeta.file}`;
                    }
                  }}
                  type="video/mp4"
                />
                Teie brauser ei toeta videot.
              </video>

              <div ref={overlayRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "90%", zIndex: 2, overflow: "hidden" }}>
                {bboxes.map((box, idx) => (
                  <React.Fragment key={idx}>
                    {(() => {
                      const prob = box.prob ?? 0;
                      const red = Math.round(255 * (1 - prob));
                      const green = Math.round(255 * prob);
                      const color = `rgb(${red}, ${green}, 0)`;

                      return (
                        <>
                          <div
                            style={{
                              position: "absolute",
                              left: box.x1,
                              top: box.y1,
                              width: box.x2 - box.x1,
                              height: box.y2 - box.y1,
                              border: `3px solid ${color}`,
                              boxSizing: "border-box",
                            }}
                          />
                          <div
                            style={{
                              zIndex: 3,
                              position: "absolute",
                              left: box.x1,
                              top: box.y1,
                              backgroundColor: color,
                              color: "white",
                              fontSize: "12px",
                              padding: "2px 4px",
                              borderRadius: "2px",
                              fontFamily: "monospace",
                            }}
                          >
                            {prob.toFixed(2)}
                          </div>
                        </>
                      );
                    })()}
                  </React.Fragment>

                ))}

              </div>
              <div style={{position: "absolute",  width: "98%", height: "5px", bottom: 20, left: "1%", zIndex: 3}}>
                <div style={{position: "realtive", width: "100%", height: "5px"}}>
                  {Object.entries(videoBookmarks).map((val) => {
                    return(<LabelIcon
                      onClick={() => handleTagClick(val)}
                      sx={{
                        position: 'absolute',
                        left: `${(val[0] * 100) / duration}%`,
                        top: 0, // adjust vertically as needed
                        transform: 'translateX(-50%) rotate(-90deg)', // center horizontally
                        cursor: 'pointer',
                        color: '#00b1bf',
                        fontSize: 36,
                        rotate: "-90"// or adjust size as needed
                      }}
                    />)
                  })}
                </div>
              </div>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}