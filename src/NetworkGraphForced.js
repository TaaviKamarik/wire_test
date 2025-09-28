import React, {useEffect, useRef, useState} from "react";
import {MultiDirectedGraph} from "graphology";
import {
  ControlsContainer,
  FullScreenControl,
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigma,
  ZoomControl
} from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import PersonInfoSheet from "./PersonInfoSheet";
import MovieInfo from "./networkgraph/MovieInfo";
import {useApiFetch} from "./hooks/useApiFetch";
import {Box, Stack, Typography} from "@mui/material";
import SearchOffIcon from '@mui/icons-material/SearchOff';


const sigmaStyle = { height: "1000px", width: "2000px" };

const GraphEvents = ({setHoveredNode, data, setSelectedNode}) => {
  const registerEvents = useRegisterEvents();

  /* eslint-disable no-console */
  useEffect(() => {
    // Register the events
    registerEvents({
      // node events
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
      clickNode: (event) => {
        const nodeId = event.node;
        if (nodeId.includes("_person")){
          setSelectedNode({type: 'persondata', id: nodeId.replace("_person", "")});

        } else {
          setSelectedNode({type: 'moviedata', id: nodeId});
        }
      },

    });
  }, [registerEvents, data]);
  /* eslint-enable no-console */

  return null;
};

// Component that load the graph
export const LoadGraph = ({hoveredNode, data}) => {
  const loadGraph = useLoadGraph();
  const setSettings = useSetSettings();
  const sigma = useSigma();

  useEffect(() => {
    if (!data) return;
    const populateGraph = () => {
      const graph = new MultiDirectedGraph();

      // First, add all nodes without size
      data.nodes.forEach((node) => {
        graph.addNode(node.id, {
          x: node.x,
          y: node.y,
          label: node.label,
          color: node.color,
          node
        });
      });

      // Then, add all edges
      data.links.forEach((link, index) => {
        graph.addEdge(link.source, link.target, {
          size: 0.05,
          label: link.roleName || link.role || `link_${index}`
        });
      });

      // Now update node size based on degree
      graph.forEachNode((nodeId, attr) => {
        const degree = graph.degree(nodeId);
        graph.setNodeAttribute(nodeId, "size", Math.max(2, 1 + degree * 0.08));
      });

      loadGraph(graph);
    };

    populateGraph();

  }, [loadGraph, data]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, highlighted: false, label: data.label };

        if (hoveredNode) {
          if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
            newData.highlighted = true;
            newData.label = data.label;
          } else {
            newData.color = '#E2E2E2';
            newData.label = "";
          }
        }

        return newData;
      },


      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, hidden: false };

        if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
          newData.hidden = true;
        }
        return newData;
      },
    });
  }, [hoveredNode, setSettings, sigma]);

  return null;
};

// Component that display the graph
export default function NetworkGraphForced ({width, height, data}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(width || "1200px");
  const [containerHeight, setContainerHeight] = useState(height || "500px");

  const [movieNode, setMovieNode] = useState(null);
  const [personNode, setPersonNode] = useState(null);

  const [selectedNode, setSelectedNode] = useState({type: null, id: null});

  const { data: dataValue, loading, error } = useApiFetch(selectedNode.type, { id: selectedNode.id }, { skip: !selectedNode.id });

  useEffect(() => {
    if (dataValue && !loading && !error) {
      if (selectedNode.type === 'persondata'){
        setMovieNode(null)
        setPersonNode(dataValue);
      } else {
        setPersonNode(null)
        setMovieNode(dataValue);
      }

    }
  }, [dataValue, loading, error]);

  useEffect(() => {
    if (selectedNode.id === null){
      setMovieNode(null)
      setPersonNode(null)
    }
  }, [selectedNode]);

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const newWidth = width || containerRef.current.offsetWidth || 500;
        const newHeight = height || containerRef.current.offsetHeight || 500;

        setContainerWidth(newWidth <= 0 ? 500 : newWidth);
        setContainerHeight(newHeight <= 0 ? 500 : newHeight);
      };

      updateDimensions();

      const handleResize = () => {
        if (containerRef.current) {
          updateDimensions();
        }
      };

      window.addEventListener('resize', handleResize);

      const timeoutId = setTimeout(updateDimensions, 100);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
      };
    }
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {data.nodes ? <SigmaContainer
        key={`sigma-container-${containerWidth}-${containerHeight}`}
        settings={{allowInvalidContainer: true}}
        layoutType="radialOut2d"
        graph={MultiDirectedGraph}
        style={{
          height: containerHeight,
          width: containerWidth,
          minWidth: "500px",
          flex: 1,
          position: "relative"
        }}
      >
        <LoadGraph hoveredNode={typeof hoveredNode === "string" ? hoveredNode : parseInt(hoveredNode)} data={data}/>
        <ControlsContainer position={'bottom-right'}>
          <ZoomControl/>
          <FullScreenControl/>
        </ControlsContainer>
        <GraphEvents setHoveredNode={setHoveredNode} data={data} setSelectedNode={setSelectedNode}/>
      </SigmaContainer> :
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            p: 4,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <SearchOffIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            <Typography variant="h5" className="font-type" textAlign="center" color="text.secondary">
              No data found for the selected filters.
            </Typography>
          </Stack>
        </Box>
      }
      {movieNode && <MovieInfo movie={movieNode} setSelectedNode={setSelectedNode} />}
      {personNode && <PersonInfoSheet person={personNode} setSelectedNode={setSelectedNode}/>}
    </div>

  );
};
