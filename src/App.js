import './App.css';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {ForceGraph2D, ForceGraph3D} from "react-force-graph";
import MovieCard from "./MovieCard";
import MovieInfoSheet from "./MovieInfoSheet";
import PersonInfoSheet from "./PersonInfoSheet";
import MovieLoadingScreen from "./MovieLoadingScreen";
import {Alert, Button, IconButton, LinearProgress, Snackbar} from "@mui/material";
import * as PropTypes from "prop-types"; // Works with Create React App and most modern bundlers

async function loadMovieData(manfredId) {
  try {

    const response = await fetch('./processed_data_4.json'); // Path relative to public folder
    const jsonData = await response.json()
    jsonData.links.forEach(link => {
      const a = jsonData.nodes.find(node => node.id === link.source);
      const b = jsonData.nodes.find(node => node.id === link.target);
      if (!a.neighbors) a.neighbors = []
      if (!b.neighbors) b.neighbors = []
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });
    return jsonData
    /*const filteredLinks = data.links.filter(link =>
      link.source === manfredId || link.target === manfredId
    );

// Collect IDs of all nodes connected to the filtered links
    const relatedNodeIds = new Set([
      manfredId, // Always include Manfred's ID
      ...filteredLinks.map(link => link.source),
      ...filteredLinks.map(link => link.target),
    ]);

// Filter the nodes to include only those with IDs in the relatedNodeIds set
    const filteredNodes = data.nodes.filter(node => relatedNodeIds.has(node.id));

// Final filtered data
    const filteredData = {
      nodes: filteredNodes,
      links: filteredLinks,
    };
    return filteredData;*/
  } catch (error) {
    console.error('Error loading movie data:', error);
    return null;
  }
}

function CloseIcon(props) {
  return null;
}

CloseIcon.propTypes = {fontSize: PropTypes.string};

function App() {
  const [movieData, setMovieData] = useState(null);
  const [inputName, setInputName] = useState("Manfred Vainokivi");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const forceRef = useRef(null);
  const [sidePanelClass, setSidePanelClass] = useState("side-panel-hidden");
  const [loading, setLoading] = useState("loading-visible");
  const [clickedNode, setClickedNode] = useState(null);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const [open, setOpen] = React.useState(false);
  const elementRef = useRef(null);


  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  useEffect(() => {
    if(!forceRef.current) return;
    console.log("REF")
    forceRef.current.d3Force("charge").strength(-120);
  });

  const scrollToTop = () => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }
    if (clickedNode) {
      highlightNodes.add(clickedNode);
      clickedNode.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      clickedNode.links.forEach(link => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
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


  useEffect(() => {
    // Fetch data when the component mounts

    loadMovieData(inputName).then((data) => {
      if (data) setMovieData(data);
    });
  }, [inputName]);

  const handleNodeClick = node => {
    console.log(node)
    highlightNodes.clear();
    highlightLinks.clear();
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
    highlightNodes.add(node);
    node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
    node.links.forEach(link => highlightLinks.add(link));
  }

  const handleBgClick = () => {
    setSidePanelClass("side-panel-hidden");
    setSelectedNode(null);
    setSelectedNodeType(null);
    setClickedNode(null);
    highlightNodes.clear();
    highlightLinks.clear();
  }

  const handleEngineStop = () => {
    setLoading("loading-invisible")
    setOpen(true)
    console.log("STOPPED!!!")
  }

  console.log(highlightNodes)

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

  return (
    <div className="App">
      <div className={loading}>
        <MovieLoadingScreen/>
      </div>
      {movieData && (
        <ForceGraph2D
          ref={forceRef}
          graphData={movieData}
          dagMode={null}
          dagLevelDistance={300}
          nodeVal={node => highlightNodes.has(node) ? (node.links.length + 3) * 10 : !highlightNodes.has(node) && highlightNodes.size > 0 ? (node.links.length + 3) * 2 : (node.links.length + 3) * 5}
          nodeLabel={node => typeof node.id === 'string' ? node.name : node.title}
          nodeColor={node => typeof node.id === 'string' && highlightNodes.has(node) ? "#E32636" : typeof node.id !== 'string' && highlightNodes.has(node) ? "#7CB9E8" : typeof node.id === 'string' ? "#E3263688" : "#7CB9E888"}
          nodeRelSize={2}
          onNodeClick={handleNodeClick}
          linkColor={link => highlightLinks.has(link) ? "#555" : "#DEDEDE"}
          autoPauseRedraw={true}
          enableNodeDrag={false}
          onBackgroundClick={handleBgClick}
          onLinkClick={handleBgClick}
          linkWidth={link => highlightLinks.has(link) ? 5 : 0.5}
          linkDirectionalParticleColor={link => highlightLinks.has(link) && "#DEDEDE" }
          linkDirectionalParticles={4}
          linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
          nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
          nodeCanvasObject={paintRing}
          onNodeHover={handleNodeHover}// More initial ticks for better layout
          onEngineStop={handleEngineStop}

        />
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

export default App;
