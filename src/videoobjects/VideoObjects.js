import React, { useEffect, useState } from "react";
import {objectsData} from "../const/objectsData";
import {KeywordList} from "./KeywordList";
import {MovieList} from "./MovieList";
import ObjectInputCard from "./ObjectInputCard";
import VideoView from "./VideoView";
import {Step, StepConnector, stepConnectorClasses, StepLabel, Stepper} from "@mui/material";
import {styled} from "@mui/material/styles";
import DoneIcon from "@mui/icons-material/Done";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import TheatersIcon from "@mui/icons-material/Theaters";
import PropTypes from "prop-types";

// Fetches list of all shapes

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(322deg, rgba(0,177,191,1) 0%, rgba(0,138,153,1) 34%, rgba(51,194,204,1) 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(322deg, rgba(0,177,191,1) 0%, rgba(0,138,153,1) 34%, rgba(51,194,204,1) 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme }) => ({
  backgroundColor: '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage:
          'linear-gradient(322deg, rgba(0,177,191,1) 0%, rgba(0,138,153,1) 34%, rgba(51,194,204,1) 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage:
          'linear-gradient(322deg, rgba(0,177,191,1) 0%, rgba(0,138,153,1) 34%, rgba(51,194,204,1) 100%)',
      },
    },
  ],
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: completed ? <DoneIcon/> : <PersonAddAlt1Icon />,
    2: completed ? <DoneIcon/> : <TheatersIcon />
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
};
function Kuvamine({ onSelect }) {

  return (
    <table>
      <thead>
      <tr>
        <th>Kujund</th>
        <th>Kokku</th>
        <th>Filme</th>
      </tr>
      </thead>
      <tbody id="tk1">
      {objectsData.map((row) => (
        <tr key={row[0]} onClick={() => onSelect(row[0])}>
          <td>{row[0].substring(4)}</td>
          <td style={{ textAlign: "right" }}>{row[1]}</td>
          <td style={{ textAlign: "right" }}>{row[2]}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

// Shows list of films for selected shape
function KujundiKuvamine({ kujund }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!kujund) return;
    fetch(
      `https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/kujundifilmid.php?olemi_kood=${kujund}`
    )
      .then((res) => res.json())
      .then(setData);
  }, [kujund]);

  if (!kujund) return null;

  return (
    <div>
      <h2>{kujund.substring(4)}</h2>
      <table>
        <thead>
        <tr>
          <th>Film</th>
          <th>Kogus</th>
        </tr>
        </thead>
        <tbody id="tk2">
        {data.map((row) => (
          <tr key={row[0]}>
            <td>
              <a href={`asjad3.html?film_id=${row[0]}&kujund=${kujund}`}>
                {row[2]}
              </a>
            </td>
            <td style={{ textAlign: "right" }}>{row[1]}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

// Main layout with both panels
export default function VideoObjects() {
  const [selectedKujund, setSelectedKujund] = useState(["fig_car", 0, 412]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieData, setMovieData] = useState([]);
  const [cardNo, setCardNo] = useState(0);
  const [videoData, setVideoData] = useState({});

  const steps = ['Choose keyword', 'Choose video'];

  const filmiParing = (id) => {
    fetch(
      `https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/kujundifilmid.php?olemi_kood=${id}`
    )
      .then((res) => res.json())
      .then(setMovieData);
  }

  const requestMovie = (id) => {
    fetch(
      `https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/filmi_kujundikohad.php?film_id=${id}`
    )
      .then((res) => res.json())
      .then(setVideoData);
  }

  return (
    <div style={cardNo !== 2 ? {display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem", gap: "4rem"} : {}}>
      {cardNo !== 2 && <Stepper alternativeLabel activeStep={cardNo} style={{display: "flex", justifyContent: "space-between"}}
                                    connector={<ColorlibConnector/>}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <div className="font-type navmenu-style">{label}</div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>}
      <div>
        {cardNo === 0 && <ObjectInputCard
          headerText="Choose keyword"
          mainText="Please select a keyword from the list"
          values={objectsData}
          cardNo={cardNo}
          setCardNo={setCardNo}
          element={selectedKujund}
          setElement={setSelectedKujund}
          newValueFunction={filmiParing}
        />}
        {/*<KeywordList onSelect={setSelectedKujund} />*/}
      </div>
        {cardNo === 1 && <ObjectInputCard
          headerText="Choose video"
          mainText="Please select a video from the list"
          values={movieData}
          cardNo={cardNo}
          setCardNo={setCardNo}
          element={selectedMovie}
          setElement={setSelectedMovie}
          type={"movie"}
          newValueFunction={requestMovie}
        />}
      <div style={{ flex: 1 }}>
        {cardNo === 2 && <VideoView data={videoData} setData={setVideoData} initialShape={selectedKujund[0]} cardNo={cardNo} setCardNo={setCardNo}/>}
      </div>
      {/*<div>

        <MovieList kujund={selectedKujund} />
      </div>*/}
    </div>
  );
}
