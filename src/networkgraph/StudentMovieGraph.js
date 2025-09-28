// components/StudentMovieGraph.jsx
import React, { useEffect, useRef, useState } from 'react';
import ForceGraph from "react-force-graph-2d";
import * as d3 from 'd3-force';

import {ForceGraph3D} from "react-force-graph";

const StudentMovieGraph = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [hoverNode, setHoverNode] = useState(null);

  const graphRef = useRef();

  useEffect(() => {
    fetch('https://dti.tlu.ee/errlinked/wire/api/studentmovies')
      .then(res => res.json())
      .then(json => {
        const degreeMap = {};
        json.links.forEach(link => {
          degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
          degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });
        json.nodes.forEach(node => {
          node.val = degreeMap[node.id] || 1;
        });

        json.links.forEach(link => {
          const movieId = json.nodes.find(n => n.group === 'movie' && n.id === link.source)?.id ||
            json.nodes.find(n => n.group === 'movie' && n.id === link.target)?.id;
          const personId = link.source === movieId ? link.target : link.source;

          const person = json.nodes.find(n => n.id === personId);
          if (person && movieId) {
            person.groupId = movieId;
          }
        });


        setData(json)
      })
      .catch(err => console.error('Failed to load graph data:', err));
  }, []);


  useEffect(() => {
    if (graphRef.current) {

      graphRef.current.d3Force('x', d3.forceX().strength(0.1));
      graphRef.current.d3Force('y', d3.forceY().strength(0.1));
      graphRef.current.d3Force('charge')?.strength(-500); // more negative = more spread

      setTimeout(() => graphRef.current.zoomToFit(400), 500);
    }
  }, [data]);


  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ForceGraph
        ref={graphRef}
        graphData={data}
        nodeRelSize={4}
        nodeLabel={node => `${node.label}\n(${node.roleName || node.typeLabel || node.group})`}
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkLabel={link => link.roleName || link.role}
        linkWidth={1}
        onEngineStop={() => {
          const nodeCoordinates = {};
          data.nodes.forEach(node => {
            nodeCoordinates[node.id] = { x: node.x, y: node.y };
          });
          console.log("Node Coordinates:", nodeCoordinates);
        }}
        onNodeHover={node => setHoverNode(node)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + 4); // padding

          ctx.fillStyle = node.color || 'gray';
          const nodeSize = Math.max(4, Math.sqrt(node.val || 1) * 3);
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
          ctx.fill();


         /* ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';*/
          if (hoverNode && hoverNode.id === node.id) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y);
          }


          node.__bckgDimensions = bckgDimensions;
        }}
      />
    </div>
  );
};

export default StudentMovieGraph;
