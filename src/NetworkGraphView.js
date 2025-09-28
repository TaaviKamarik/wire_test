import './App.css';
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ForceGraph2D} from "react-force-graph";
import MovieInfoSheet from "./MovieInfoSheet";
import PersonInfoSheet from "./PersonInfoSheet";
import {Alert, IconButton, Snackbar} from "@mui/material";
import * as PropTypes from "prop-types";
import NetworkFilters from "./NetworkFilters"; // Works with Create React NetworkGraphView and most modern bundlers

async function loadMovieData(manfredId, setGenreList, setRoleList) {
  try {

    const response = await fetch('./processed_data_4.json'); // Path relative to public folder
    const jsonData = await response.json()
    let genreList = []
    let roleList = []
    jsonData.nodes.forEach(node => {
      if (typeof node.id === 'number') {
        node.genre = node.genre.split('Žanr: ')
      }

      if (node.genre) {
        genreList = [...new Set([...genreList, ...node.genre])]

      }
      if (node.roles) {
        roleList = [...new Set([...roleList, ...node.roles])]
      }
    })
    jsonData.links.forEach(link => {
      link.id = `${link.source}-${link.target}`;
      const a = jsonData.nodes.find(node => node.id === link.source);
      const b = jsonData.nodes.find(node => node.id === link.target);
      if (!a.neighbors) a.neighbors = []
      if (!b.neighbors) b.neighbors = []
      if (b.genre) {
        if (!a.neighbourGenres) a.neighbourGenres = []
        a.neighbourGenres = [...new Set([...a.neighbourGenres, ...b.genre])]
      }
      if (b.subtype) {
        if (!a.neighbourSubtypes) a.neighbourSubtypes = []
        a.neighbourSubtypes = [...new Set([...a.neighbourSubtypes, b.subtype])]
      }
      if (a.subtype) {
        if (!b.neighbourSubtypes) b.neighbourSubtypes = []
        b.neighbourSubtypes = [...new Set([...b.neighbourSubtypes, a.subtype])]
      }

      if (a.year) {
        if (!b.neighbourYears) b.neighbourYears = []
        b.neighbourYears = [...new Set([...b.neighbourYears, a.year])]
      }

      if (b.year) {
        if (!a.neighbourYears) a.neighbourYears = []
        a.neighbourYears = [...new Set([...a.neighbourYears, b.year])]
      }

      if (a.genre) {
        if (!b.neighbourGenres) b.neighbourGenres = []
        b.neighbourGenres = [...new Set([...b.neighbourGenres, ...a.genre])]
      }
      if (b.roles) {
        if (!a.neighbourRoles) a.neighbourRoles = []
        a.neighbourRoles = [...new Set([...a.neighbourRoles, ...b.roles])]
      }
      if (a.roles) {
        if (!b.neighbourRoles) b.neighbourRoles = []
        b.neighbourRoles = [...new Set([...b.neighbourRoles, ...a.roles])]
      }
      a.neighbors.push(b.id);
      b.neighbors.push(a.id);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link.id);
      b.links.push(link.id);
    });
    setGenreList(genreList)
    setRoleList(roleList)
    console.log(jsonData)

  } catch (error) {
    console.error('Error loading movie data:', error);
    return null;
  }
}

async function loadMovieDataAlt(manfredId, setGenreList, setRoleList) {
  try {

    const response = await fetch('./processed_data.json'); // Path relative to public folder
    return await response.json()

  } catch (error) {
    console.error('Error loading movie data:', error);
    return null;
  }
}

function CloseIcon(props) {
  return null;
}

CloseIcon.propTypes = {fontSize: PropTypes.string};

function NetworkGraphView() {
  const [originalMovieData, setOriginalMovieData] = useState(null);
  const [movieData, setMovieData] = useState(null);
  const [inputName, setInputName] = useState("Manfred Vainokivi");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const forceRef = useRef(null);
  const [sidePanelClass, setSidePanelClass] = useState("side-panel-hidden");
  const [loading, setLoading] = useState("loading-visible");
  const [clickedNode, setClickedNode] = useState(null);

  const [highlightNodes, setHighlightNodes] = useState([]);
  const [highlightLinks, setHighlightLinks] = useState([]);
  const [hoverNode, setHoverNode] = useState(null);
  const [open, setOpen] = React.useState(false);
  const elementRef = useRef(null);
  const [genreList, setGenreList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);

  const [visibleMovies, setVisibleMovies] = useState([]);
  const [visiblePersons, setVisiblePersons] = useState([]);
  const [visibleLinks, setVisibleLinks] = useState([]);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const fgRef = useRef();

  const handleFilterUpdate = (filteredData) => {
    setMovieData(filteredData);
  };

  //console.log(genreList)

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  useEffect(() => {
    if(!forceRef.current) return;
    //console.log("REF")
    forceRef.current.d3Force("charge").strength(-120);
  });

  useMemo(() => {
    // Fetch data when the component mounts
    loadMovieDataAlt(inputName, setGenreList, setRoleList).then((data) => {
      if (data) {
        setOriginalMovieData(data);
        setMovieData(data);
      }
    });
  }, [inputName]);

  const scrollToTop = () => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  //console.log(movieData)

  const handleNodeHover = node => {
    const innerHighlightNodes = [];
    const innerHighlightLinks = [];
    if (node) {
      innerHighlightNodes.push(node.id);
      node.neighbors.forEach(neighbor => highlightNodes.push(neighbor));
      node.links.forEach(link => innerHighlightLinks.push(link));
    }
    if (clickedNode) {
      innerHighlightNodes.push(clickedNode.id);
      clickedNode.neighbors.forEach(neighbor => highlightNodes.push(neighbor));
      clickedNode.links.forEach(link => innerHighlightLinks.push(link));
    }

    setHoverNode(node || null);
    setHighlightNodes(innerHighlightNodes);
    setHighlightLinks(innerHighlightLinks);
  };

  const handleLinkHover = link => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing = useCallback((node, ctx) => {
    // add ring just for highlighted nodes
    ctx.beginPath();
    ctx.arc(node.x, node.y, (node.links.length + 2) / 2 + 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
    ctx.fill();
  }, [hoverNode]);


  /*useEffect(() => {
    // Fetch data when the component mounts

    loadMovieDataAlt(inputName, setGenreList, setRoleList).then((data) => {
      if (data) setMovieData(data);
    });
  }, [inputName]);*/

  const handleNodeClick = node => {
    const innerHighlightNodes = [];
    const innerHighlightLinks = [];

    setHoverNode(null);
    if(typeof node.id === 'string') {
      setSelectedNode(node);
      setSelectedNodeType('person');
    } else {
      setSelectedNode(node);
      setSelectedNodeType('movie');
    }
    setClickedNode(null);
    setSidePanelClass("side-panel-visible")
    setClickedNode(node);
    innerHighlightNodes.push(node.id);
    node.neighbors.forEach(neighbor => innerHighlightNodes.push(neighbor));
    node.links.forEach(link => innerHighlightLinks.push(link));
    setHighlightNodes(innerHighlightNodes);
    setHighlightLinks(innerHighlightLinks);
  }

  const handleBgClick = () => {
    setSidePanelClass("side-panel-hidden");
    setSelectedNode(null);
    setSelectedNodeType(null);
    setClickedNode(null);
    setHighlightNodes([]);
    setHighlightLinks([]);
  }

  const handleEngineStop = (e) => {
    setLoading("loading-invisible")
    setOpen(true)
    setFilterVisible(true)
    setMovieData(prevData => ({
      ...prevData,
      nodes: prevData.nodes.map(node => ({
        ...node,
        fx: node.x,
        fy: node.y
      })),
      links: [...prevData.links]
    }));
    //console.log("STOPPED!!!")
  }

  //console.log(movieData)

  //console.log(highlightNodes)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  //console.log(selectedGenres)

  useEffect(() => {
    if (fgRef.current) {
      // Disable simulation forces
      fgRef.current.d3Force('charge', null);
      fgRef.current.d3Force('center', null);
      fgRef.current.d3Force('link', null);

      // Assign fixed positions
      movieData.nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
      });

      // Render with positions only
      fgRef.current.cooldownTicks(0);
      fgRef.current.d3ReheatSimulation();
    }
  }, []);

  return (
    <div className="App">
      {/*<div className={loading}>
        <MovieLoadingScreen/>
      </div>*/}
      {movieData && (
        <>
          {filterVisible && <NetworkFilters
            movieData={originalMovieData}
            onFilterUpdate={handleFilterUpdate}
            genreList={genreList}
            roleList={roleList}
            selectedGenres={selectedGenres}
            selectedRoles={selectedRoles}
            setSelectedGenres={setSelectedGenres}
            setSelectedRoles={setSelectedRoles}
          />}
          <ForceGraph2D
            node
            ref={fgRef}
            graphData={movieData}
            dagMode={null}
            dagLevelDistance={300}
            nodeVal={node => (highlightNodes.includes(node.id) ? (node.links.length + 3) * 10 : !highlightNodes.includes(node.id) && highlightNodes.length > 0 ? (node.links.length + 3) * 2 : (node.links.length + 3) * 5)}
            nodeLabel={node => typeof node.id === 'string' ? node.name : node.title}
            nodeColor={node => typeof node.id === 'string' && highlightNodes.includes(node.id) ? "#E32636" : typeof node.id !== 'string' && highlightNodes.includes(node.id) ? "#7CB9E8" : typeof node.id === 'string' ? "#E3263688" : "#7CB9E888"}
            nodeRelSize={2}
            onNodeClick={handleNodeClick}
            linkColor={link => highlightLinks.includes(link.id) ? "#555" : "#DEDEDE"}
            autoPauseRedraw={true}
            enableNodeDrag={false}
            onBackgroundClick={handleBgClick}
            onLinkClick={handleBgClick}
            nodeVisibility={node => (selectedRoles.length === 0 || (selectedRoles.length !== 0 && selectedRoles.some(role => node.roles?.includes(role) || node.neighbourRoles?.includes(role)))) && (selectedGenres.length === 0 || (selectedGenres.length !== 0 && selectedGenres.some(genre => node.genre?.includes(genre) || node.neighbourGenres?.includes(genre))))}
            linkVisibility={link => (selectedRoles.length === 0 || selectedRoles.some(role => link.source.roles?.includes(role) || link.target.roles?.includes(role))) && (selectedGenres.length === 0 || selectedGenres.some(genre => link.source.genre?.includes(genre) || link.target.genre?.includes(genre)))}
            linkWidth={link => highlightLinks.includes(link.id) ? 5 : 0.5}
            linkDirectionalParticleColor={link => highlightLinks.includes(link.id) && "#DEDEDE" }
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={link => highlightLinks.includes(link.id) ? 4 : 0}
            nodeCanvasObjectMode={node => highlightNodes.includes(node.id) ? 'before' : undefined}
            nodeCanvasObject={paintRing}
            onNodeHover={handleNodeHover}// More initial ticks for better layout
            onEngineStop={handleEngineStop}
          />
        </>
      )}
      <Snackbar
        open={open}
        autoHideDuration={20000}
        onClose={handleClose}
        message="Note archived"
        action={action}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          onClose={handleClose}
          severity={"info"}
          variant="filled"
          sx={{ width: '100%', display: "flex", justifyContent: "start" }}
        >
          <div>Hover on a node to see names associated to the node.</div>
          <div>Click node to make node info appear.</div>
          Blue nodes represent movies and red nodes represent people.
        </Alert>
      </Snackbar>
      <div ref={elementRef} className={sidePanelClass}>
        {selectedNode && selectedNodeType === 'movie' && <MovieInfoSheet movie={selectedNode} setSelectedNodeType={setSelectedNodeType} setSelectedNode={setSelectedNode} nodes={movieData.nodes} handleNodeClick={handleNodeClick} scrollToTop={scrollToTop}/>}
        {selectedNode && selectedNodeType === 'person' && <PersonInfoSheet person={selectedNode} setSelectedNodeType={setSelectedNodeType} setSelectedNode={setSelectedNode} nodes={movieData.nodes} handleNodeClick={handleNodeClick} scrollToTop={scrollToTop}/>}
      </div>
    </div>
  );
}

export default NetworkGraphView;
