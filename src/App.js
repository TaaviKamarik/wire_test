import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";
import {
  Container,
  CssBaseline,
  Menu as MuiMenu,
  MenuItem,
} from "@mui/material";
import { Layout } from "antd";
import { Header } from "antd/es/layout/layout";
import NetworkGraphForced from "./appcomponents/NetworkGraphForced";
import FacetConnectionExplorer from "./appcomponents/FacetConnectionExplorer";
import SceneClusteringView from "./appcomponents/SceneClusteringView";
import TemporalFlowGraph from "./appcomponents/TemporalFlowGraph";
import FacetTransitionSankey from "./appcomponents/FacetTransitionSankey";
import SigmaCooccurrenceGraph from "./appcomponents/SigmaCooccurrenceGraph";
import { loadMovieDataAlt } from "./utils/utils";
import { useFilterStore } from "./hooks/useGraphFilterState";
import VideoKeywords from "./appcomponents/VideoKeywords";
import VideoKeywordsSide from "./appcomponents/VideoKeywordsSide";
import VideoObjects from "./appcomponents/VideoObjects";
import MovieLoadingScreen from "./appcomponents/MovieLoadingScreen";
import SidebarFilterDrawer from "./appcomponents/SidebarFilters";
import "./App.css";
import VideoExplainer from "./appcomponents/VideoExplainer";

function App() {
  const containerRef = useRef(0);
  const containerHeightRef = useRef(0);
  const [width, setWidth] = useState("1200px");
  const [height, setHeight] = useState(null);
  const [data, setData] = useState(null);
  const [entryCount, setEntryCount] = useState([5, 5, 5, 1]);
  const [filteredData, setFilteredData] = useState(null);
  const graphFilters = useFilterStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const dropdownOpen = Boolean(anchorEl);

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const getData = async () => {
      const movieData = await loadMovieDataAlt();
      setFilteredData(movieData);
      setData(movieData);
    };
    getData();
  }, []);

  const filterdataValues = async () => {
    // ...existing logic...
  };

  return (
    <Router basename="/errlinked/wire">
      <CssBaseline />
      <Layout style={{ height: "100vh" }}>
        <Header
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          className="bg-primary"
        >
          <div className="demo-logo" />
          <span
            onClick={handleDropdownClick}
            className={"font-type navmenu-style"}
            style={{ cursor: "pointer" }}
          >
            Tool Selection ▾
          </span>
          <MuiMenu
            anchorEl={anchorEl}
            open={dropdownOpen}
            onClose={handleDropdownClose}
            MenuListProps={{
              sx: { py: 0 },
            }}
          >
            <MenuItem onClick={handleDropdownClose} component={NavLink} to="/">
              BFM Network
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/video-keywords"
            >
              Video keyword finder
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/video-objects"
            >
              Video object identifier
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/video-explainer"
            >
              Video explainer
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/facet-explorer"
            >
              Facet Explorer
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/scene-clustering"
            >
              Scene Clustering
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/temporal-flow"
            >
              Temporal Flow
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/transition-sankey"
            >
              Facet Transition Sankey
            </MenuItem>
            <MenuItem
              onClick={handleDropdownClose}
              component={NavLink}
              to="/sigma-graph"
            >
              Co-occurrence Network
            </MenuItem>
          </MuiMenu>
        </Header>
        <Layout style={{ display: "flex" }}>
          <Routes>
            <Route
              path="/"
              element={
                filteredData ? (
                  <SidebarFilterDrawer
                    entryCount={entryCount}
                    setEntryCount={setEntryCount}
                    filterValues={graphFilters}
                    onApplyFilters={filterdataValues}
                    menuEntries={data ? data.filters : []}
                  />
                ) : null
              }
            />
            <Route path="/video-keywords" element={<VideoKeywordsSide />} />
            <Route path="/facet-explorer" element={null} />
            <Route path="/scene-clustering" element={null} />
            <Route path="/temporal-flow" element={null} />
            <Route path="/transition-sankey" element={null} />
            <Route path="/sigma-graph" element={null} />
          </Routes>
          <Layout ref={containerRef}>
            <Container
              disableGutters
              ref={containerHeightRef}
              maxWidth={false}
              sx={{ margin: 0, padding: 0, height: "100%" }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    filteredData ? (
                      <NetworkGraphForced
                        width={width}
                        data={filteredData}
                        height={height}
                      />
                    ) : (
                      <MovieLoadingScreen />
                    )
                  }
                />
                {/*<Route path="/" element={<StudentMovieGraph/>} />*/}
                <Route path="/video-keywords" element={<VideoKeywords />} />
                <Route path="/video-objects" element={<VideoObjects />} />
                <Route path="/video-explainer" element={<VideoExplainer />} />
                <Route
                  path="/facet-explorer"
                  element={
                    <FacetConnectionExplorer
                      dataUrl={`${process.env.PUBLIC_URL}/all_movies.json`}
                    />
                  }
                />
                <Route
                  path="/scene-clustering"
                  element={
                    <SceneClusteringView
                      dataUrl={`${process.env.PUBLIC_URL}/all_movies.json`}
                    />
                  }
                />
                <Route
                  path="/temporal-flow"
                  element={
                    <TemporalFlowGraph
                      dataUrl={`${process.env.PUBLIC_URL}/all_movies.json`}
                    />
                  }
                />
                <Route
                  path="/transition-sankey"
                  element={
                    <FacetTransitionSankey
                      dataUrl={`${process.env.PUBLIC_URL}/all_movies.json`}
                    />
                  }
                />
                <Route
                  path="/sigma-graph"
                  element={
                    <SigmaCooccurrenceGraph
                      dataUrl={`${process.env.PUBLIC_URL}/all_movies.json`}
                    />
                  }
                />
              </Routes>
            </Container>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
