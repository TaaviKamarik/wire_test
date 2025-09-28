import React, {useEffect, useRef, useState} from 'react';
import {
  Autocomplete, Button,
  List, ListItem, ListItemText, Paper, Skeleton,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  TextField, Typography
} from "@mui/material";
import PropTypes from "prop-types";
import {styled} from "@mui/material/styles";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TheatersIcon from '@mui/icons-material/Theaters';
import DoneIcon from '@mui/icons-material/Done';
import InputCard from "./InputCard";
import {countsJson} from "../const/const";
import {dataArray, firstData} from "../const/dataArray";
import MovieSelectCard from "./MovieSelectCard";
import ReactPlayer from "react-player";
import LabelIcon from '@mui/icons-material/Label';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeywordsTabCard from "./KeywordsTabCard";
import VerticalTabsKeywords from "./VerticalTabsKeywords";

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
    2: completed ? <DoneIcon/> : <GroupAddIcon />,
    3: completed ? <DoneIcon/> : <TheatersIcon />,
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

const steps = ['Add first entity', 'Add second entity', 'Choose the video'];

const VideoKeywords = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [firstElement, setFirstElement] = useState(null);
  const [secondElement, setSecondElement] = useState(null);
  const [secondValue, setSecondValue] = useState([]);
  const [movieData, setMovieData] = useState([]);
  const [movieElement, setMovieElement] = useState(null);
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [videoBookmarks, setVideoBookmarks] = useState([]);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef()
  const [currentSentence, setCurrentSentence] = useState(null);

  const [separatedData, setSeparatedData] = useState(null);

  const extractSecondLevelData = (data) => {
    let result = [];

    // Iterate over first-level keys
    Object.keys(data).forEach(firstLevelKey => {
      // Iterate over second-level keys and extract data
      Object.entries(data[firstLevelKey]).forEach(([key, value]) => {
        result.push({
          key: key,
          name: value.name,
          count: value.count
        });
      });
    });

    return result;
  };

  const nameCountMap = [];

  dataArray.forEach((val) => {
    nameCountMap.push([val.key, val.count, null])
  });

  //console.log(nameCountMap);

  const fetchSecondData = async (elem) => {
    const response = await fetch(`https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/olemi_seosed.php?olemi_kood=${elem[0]}`);
    const data = await response.json();
    setSecondValue(data);
  }

  const movieDataSetter = (elem) => {
    setMovieData(JSON.parse(elem[2]))
  }

  const movieFetcher = async (elem) => {
    const response = await fetch(`https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/paring2.php?film_id=${elem}`);
    const data = await response.json();
    const sentences = await fetch(`https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/filmi_laused.php?film_id=${elem}`);
    const sentData = await sentences.json();
    const keywords = await fetch(`https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/filmi_lemmakohad.php?film_id=${elem}`);
    const keyData = await keywords.json();
    const keywords2 = await fetch(`https://minitorn.tlu.ee/~jaagup/oma/too/25/02/paringud/filmi_kohad2.php?film_id=${elem}`);
    const keyData2 = await keywords2.json();



    const sortedKeywords = Object.entries(keyData)
      .sort((a, b) => b[1].length - a[1].length);

    setSelectedMovieData({data: data, sentences: sentData, keywords: sortedKeywords, keywords2: keyData2});
  }

  useEffect(() => {
    if (!selectedMovieData) return
    const emptyObj = {per: [], org: [], loc: [], kw: [], verb: []};
    Object.entries(selectedMovieData.keywords2).forEach((key, val) => {
      if(key[0].startsWith("kw_")) {
        emptyObj.kw.push([key[0].replace("kw_", ""), key[1]])
      }
      else if(key[0].startsWith("per_")) {
        emptyObj.per.push([key[0]
          .replace("per_", "")
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          , key[1]])
      }
      else if(key[0].startsWith("org_")) {
        emptyObj.org.push([key[0]
          .replace("org_", "")
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          , key[1]])
      }
      else if(key[0].startsWith("loc_")) {
        emptyObj.loc.push([key[0]
          .replace("loc_", "")
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          , key[1]])
      }
      else if(key[0].startsWith("verb-org_") || key[0].startsWith("verb-loc_") || key[0].startsWith("verb-per_")) {
        emptyObj.verb.push([key[0]
          .replace("verb-org_", "")
          .replace("verb-loc_", "")
          .replace("verb-per_", "")
          , key[1]])
      }
    })

    for (const type of ["kw", "per", "org", "loc", "verb"]) {
      emptyObj[type].sort((a, b) => b[1].length - a[1].length);
    }

    setSeparatedData(emptyObj)

  }, [selectedMovieData]);

  //console.log(secondValue);
  //console.log(selectedMovieData)

  const handleDuration = (movDur) => {
    //console.log(movDur);
    setDuration(movDur)
  }

  const handleTagClick = (val) => {
    videoRef.current.seekTo(val[1], 'seconds')
    setCurrentSentence(selectedMovieData.sentences[val[0]][2])
  }

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem", gap: "4rem"}}>
      {activeStep !== 3 && <Stepper alternativeLabel activeStep={activeStep} style={{display: "flex", justifyContent: "space-between"}}
                connector={<ColorlibConnector/>}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <div className="font-type navmenu-style">{label}</div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>}
      {activeStep === 0 &&
        <InputCard
          values={firstData}
          headerText={"Input first entity"}
          mainText={"Input a organization, person or location to find connected videos."}
          cardNo={activeStep}
          setCardNo={setActiveStep}
          element={firstElement}
          setElement={setFirstElement}
          newValueFunction={fetchSecondData}
        />}
      {activeStep === 1 &&
        <InputCard
          values={secondValue}
          headerText={"Input second entity"}
          mainText={"Input a organization, person or location to find connected videos."}
          cardNo={activeStep}
          setCardNo={setActiveStep}
          element={secondElement}
          setElement={setSecondElement}
          newValueFunction={movieDataSetter}
        />}
      {activeStep === 2 &&
        <MovieSelectCard
          values={movieData}
          headerText={"Input second entity"}
          mainText={"Input a organization, person or location to find connected videos."}
          cardNo={activeStep}
          setCardNo={setActiveStep}
          element={movieElement}
          setElement={setMovieElement}
          newValueFunction={movieFetcher}
        />}
      {activeStep === 3 && selectedMovieData &&
        <div style={{display: "flex", gap: "1rem", alignItems: "start"}}>
          {/*<div style={{padding: "0.5rem"}}>
            <Button onClick={() => {
              setActiveStep(2);
              setSelectedMovieData(null);
            }} sx={{background: "#00b1bf"}} startIcon={<ChevronLeftIcon/>} variant="contained" color="primary">
              back
            </Button>
          </div>*/}
          {separatedData &&
            <div>
              <div style={{paddingTop: "0.5rem"}}>
                <Button onClick={() => {
                  setActiveStep(2);
                  setSelectedMovieData(null);
                }} sx={{background: "#00b1bf"}} startIcon={<ChevronLeftIcon/>} variant="contained" color="primary">
                  back
                </Button>
              </div>
              <VerticalTabsKeywords separatedKeywords={separatedData} setCurrentSentence={setCurrentSentence}
                                    setVideoBookmarks={setVideoBookmarks}/>
            </div>
            }


          {/*<div>
            <div className="font-type navmenu-style" style={{padding: "0.5rem"}}>Keywords</div>
            <KeywordsTabCard setCurrentSentence={setCurrentSentence} data={separatedData.kw} setVideoBookmarks={setVideoBookmarks} />
          </div>*/}
          <div>
            <Typography variant="h4" className="font-type navmenu-style" style={{padding: "0.5rem"}}>{selectedMovieData.data.videofailid[0][2]}</Typography>
            <div style={{display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", position: "relative"}}>
              <ReactPlayer ref={videoRef} onDuration={handleDuration} height="500px" width={"889px"} controls url={`https://cdn.efis.ee/is/EfisFilms/Video/${selectedMovieData.data.videofailid[0][1]}/${selectedMovieData.data.videofailid[0][0]}`} />
              <div style={{position: "absolute",  width: "96%", height: "5px", bottom: 20}}>
                <div style={{position: "realtive", width: "100%", height: "5px"}}>
                  {videoBookmarks.map((val) => {
                    return(<LabelIcon
                      onClick={() => handleTagClick(val)}
                      sx={{
                        position: 'absolute',
                        left: `${(val[1] * 100) / duration}%`,
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
            </div>
            {currentSentence && <Paper style={{
              fontSize: "1rem",
              marginTop: "1rem",
              padding: "1rem",
              maxWidth: "889px"
            }}>{currentSentence}</Paper>}

          </div>
        </div>}
      {activeStep === 3 && !selectedMovieData &&
        <div style={{display: "flex", gap: "1rem", alignItems: "start"}}>
          <div style={{paddingBottom: "0.5rem"}}>
            <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
            <Skeleton variant="rounded" width={210} height={500} />
          </div>
          <div style={{paddingBottom: "0.5rem"}}>
            <Skeleton variant="text" sx={{ fontSize: '2rem' }} />
            <Skeleton variant="rounded" width={889} height={500} />
          </div>
        </div>
      }
    </div>
  );
};

export default VideoKeywords;