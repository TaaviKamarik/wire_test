import React, { useRef } from "react";
import videoData from '../files/explainerdata/video_analysis_new.json';
import videoData2 from '../files/explainerdata/video_analysis_new_2.json';
import videoData3 from '../files/explainerdata/video_analysis_new_3.json';
import {Button} from "@mui/material";

const VideoExplainer = () => {
  const videoRef = useRef(null);
  const [actions, setActions] = React.useState([]);
  const [caption, setCaption] = React.useState("");
  const [video, setVideo] = React.useState(videoData);
  const [videoLink, setVideoLink] = React.useState("https://cdn.efis.ee/is/EfisFilms/Video/17066/6b244e283378baffafbe7b960468624fd28e64e8.mp4");
  const [shot, setShot] = React.useState(null);

  const handleSkip = (point) => {
    if (videoRef.current) {
      setCaption(point.caption);
      setActions(point.action === "Error" || !point.action || point.action.length === 0 ? point.actions : point.action);
      videoRef.current.currentTime = point.milliseconds / 1000;
      setShot(point.shot_type);
      //videoRef.current.play();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", paddingTop: "1rem", paddingBottom: "1rem", paddingLeft: "1rem", gap: "1rem" }}>
        <Button sx={{background: "#00b1bf"}} variant="contained" onClick={() => {
          setVideo(videoData);
          setShot(null)
          setVideoLink("https://cdn.efis.ee/is/EfisFilms/Video/17066/6b244e283378baffafbe7b960468624fd28e64e8.mp4")
        }
        }>Video 1</Button>
        <Button sx={{background: "#00b1bf"}} variant="contained" onClick={() => {
          setVideo(videoData2)
          setShot(null)
          setVideoLink("https://cdn.efis.ee/is/EfisFilms/Video/4013/6eccd76f5a2ab1eaf9340458ea6cca809eacf764.mp4")
        }
        }>Video 2</Button>
        <Button sx={{background: "#00b1bf"}} variant="contained" onClick={() => {
          setVideo(videoData3)
          setShot(null)
          setVideoLink("https://cdn.efis.ee/is/EfisFilms/Video/19922/8b47c503c1c2529e597737c2dbd67e06940e4cd4.mp4")
        }
        }>VEesti + shots</Button>
      </div>
      <div style={{ display: "flex", padding: "1rem", gap: "4rem" }}>
        {/* Buttons */}
        <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", height: 600, minWidth: 200, overflowY: "scroll"}}>
          {video.map((point) => (
            <Button
              sx={{background: "#00b1bf"}}
              fullWidth
              variant={"contained"}
              key={point.time}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => handleSkip(point)}
            >
              {point.time}
            </Button>
          ))}
        </div>

        {/* Video Player */}
        <div>
          <div className="flex-1">
            <video
              ref={videoRef}
              height={500}
              controls
              className="w-full rounded shadow"
              src={videoLink}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-lg font-bold">Actions</h3>
              <ul className="list-disc pl-5">
                {actions.map((action, index) => (
                  <li key={index} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow mt-4">
              <h3 className="text-lg font-bold">Caption</h3>
              <p className="text-gray-700">{caption}</p>
            </div>
            {shot && <div className="bg-gray-100 p-4 rounded shadow mt-4">
              <h3 className="text-lg font-bold">Shot type</h3>
              <p className="text-gray-700">{shot}</p>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoExplainer;