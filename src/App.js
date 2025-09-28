import React, {useEffect, useRef, useState} from "react";
import {BrowserRouter as Router, Link, NavLink, Route, Routes} from "react-router-dom";
import {Box, Button, Checkbox, Container, CssBaseline, List, ListItem, ListItemText} from "@mui/material";
import {DatePicker, Layout, Menu} from "antd";
import {Header} from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import NetworkGraphForced from "./NetworkGraphForced";
import {genres, loadMovieDataAlt, roles, subTypes, years} from "./utils/utils";
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {useFilterStore} from "./hooks/useGraphFilterState";
import VideoKeywords from "./moviekeyword/VideoKeywords";
import VideoKeywordsSide from "./moviekeyword/VideoKeywordsSide";
import VideoObjects from "./videoobjects/VideoObjects";
import MovieLoadingScreen from "./networkgraph/MovieLoadingScreen";
import StudentMovieGraph from "./networkgraph/StudentMovieGraph";
import StudentMovieCluster from "./networkgraph/StudentMovieCluster";
import SidebarFilters from "./components/SidebarFilters";
import SidebarFilterDrawer from "./components/SidebarFilters";
import "./App.css"
import VideoExplainer from "./videoexplainer/VideoExplainer";

function App() {

  const containerRef = useRef(0)
  const containerHeightRef = useRef(0)
  const [width, setWidth] = useState("1200px")
  const [height, setHeight] = useState(null)
  const [data, setData] = useState(null)
  const [entryCount, setEntryCount] = useState([5,5,5,1])
  const [filters, setFilters] = useState([])
  const [filteredData, setFilteredData] = useState(null)
  const graphFilters = useFilterStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuEntries = [genres, roles, subTypes, years];
  const filterArray = [graphFilters.genres, graphFilters.roles, graphFilters.types, graphFilters.years];
  const filterUpdaters = [
    graphFilters.updateGenres,
    graphFilters.updateRoles,
    graphFilters.updateTypes,
    graphFilters.updateYears
  ];

  const onChange = (value, currentFilter, updater) => {
    if (currentFilter.includes(value)) {
      updater(currentFilter.filter(item => item !== value));
    } else {
      updater([...currentFilter, value]);
    }
  };

  const onChange2 = (dates, dateStrings) => {
    const [start, end] = dateStrings.map(str => parseInt(str));
    if (!isNaN(start) && !isNaN(end)) {
      graphFilters.updateYears([start, end]);
    } else {
      graphFilters.updateYears([]);
    }
  };




  useEffect(() => {
    const getData = async () => {
      const movieData = await loadMovieDataAlt();
      setFilteredData(movieData)
      setData(movieData);
    }

    getData()
  }, []);

  const filterdataValues = async () => {
    const params = new URLSearchParams();

    if (graphFilters.types.length) {
      graphFilters.types.forEach(t => params.append('types[]', t));
    }

    if (graphFilters.roles.length) {
      graphFilters.roles.forEach(r => {
        const prefix = r.startsWith('FILM_MAKER_') ? 'maker' : 'actor';
        params.append('roles[]', `${prefix}:${r}`);
      });
    }

    if (graphFilters.festivals.length) {
      graphFilters.festivals.forEach(f => params.append('festivals[]', f));
    }

    if (graphFilters.years.length === 2) {
      params.append('start_year', graphFilters.years[0]);
      params.append('end_year', graphFilters.years[1]);
    }

    const url = `https://dti.tlu.ee/errlinked/wire/api/studentmovies?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();
    setFilteredData(result);
  };


  //console.log(graphFilters.genres)
  //console.log(filteredData)
  //console.log(data)

  useEffect(() => {
    if (!containerRef.current || !containerHeightRef.current) return
    setWidth(containerRef.current.offsetWidth)
    setHeight(containerHeightRef.current.offsetHeight)
  }, [containerRef, containerHeightRef])

  return (
    <Router basename="/errlinked/wire">
      <CssBaseline />
      <Layout style={{height: "100vh"}}>
        <Header style={{ display: 'flex', alignItems: 'center', gap: "1rem"}} className="bg-primary">
          <div className="demo-logo" />
         {/* <NavLink
            to="/"
            className={"font-type navmenu-style"}
          >
            Home
          </NavLink>*/}
          {/*<div className={"font-type navmenu-style"}>/</div>*/}
          <NavLink
            to="/"
            className={"font-type navmenu-style"}
          >
            BFM Network
          </NavLink>
          <div className={"font-type navmenu-style"}>/</div>
          <NavLink
            to="/video-keywords"
            className={"font-type navmenu-style"}
          >
            Video keyword finder
          </NavLink>
          <div className={"font-type navmenu-style"}>/</div>
          <NavLink
            to="/video-objects"
            className={"font-type navmenu-style"}
          >
            Video object identifier
          </NavLink>
          <div className={"font-type navmenu-style"}>/</div>
          <NavLink
            to="/video-explainer"
            className={"font-type navmenu-style"}
          >
            Video explainer
          </NavLink>
        </Header>
        <Layout style={{display: "flex"}}>

            <Routes>
              <Route path="/" element={filteredData ? (
                <SidebarFilterDrawer
                  entryCount={entryCount}
                  setEntryCount={setEntryCount}
                  filterValues={graphFilters}
                  onApplyFilters={filterdataValues}
                  menuEntries={data.filters}
                />



              ) : null} />

              <Route path="/" element={<VideoKeywordsSide/>} />
            </Routes>


          <Layout  ref={containerRef} >
            <Container disableGutters allowInvalidContainer ref={containerHeightRef} maxWidth={false} sx={{ margin: 0, padding: 0, height: "100%" }}>
              <Routes>
                <Route path="/" element={filteredData ?
                  <NetworkGraphForced width={width} data={filteredData} height={height}/>
                  :
                  <MovieLoadingScreen/>} />


                {/*<Route path="/" element={<StudentMovieGraph/>} />*/}

                <Route path="/video-keywords" element={<VideoKeywords/>} />
                <Route path="/video-objects" element={<VideoObjects/>} />
                <Route path="/video-explainer" element={<VideoExplainer/>} />
              </Routes>
            </Container>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
