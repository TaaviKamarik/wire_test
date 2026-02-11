import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const WIDTH = 1200;
const HEIGHT = 800;
const MOVIE_RADIUS = 30;
const PERSON_RADIUS = 8;
const CLUSTER_RADIUS = 120;

const StudentMovieCluster = () => {
  const ref = useRef();

  useEffect(() => {
    fetch('https://dti.tlu.ee/errlinked/wire/api/studentmovies')
      .then(res => res.json())
      .then(({ nodes, links }) => {
        const svg = d3.select(ref.current)
          .attr("width", WIDTH)
          .attr("height", HEIGHT)
          .style("background", "#fafafa");

        svg.selectAll("*").remove(); // clear previous

        // Group by movies
        const movies = nodes.filter(n => n.group === 'movie');
        const people = nodes.filter(n => n.group !== 'movie');

        const movieMap = Object.fromEntries(movies.map(m => [m.id, m]));

        // Map movie -> its people
        const connections = {};
        links.forEach(link => {
          const movieId = movieMap[link.source] ? link.source : link.target;
          const personId = movieMap[link.source] ? link.target : link.source;

          if (!connections[movieId]) connections[movieId] = [];
          connections[movieId].push({
            ...people.find(p => p.id === personId),
            roleName: link.roleName || link.role || ''
          });
        });

        const cols = 3;
        const spacingX = WIDTH / cols;
        const spacingY = 250;

        movies.forEach((movie, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const cx = col * spacingX + spacingX / 2;
          const cy = row * spacingY + 100;

          // Draw movie node
          svg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", MOVIE_RADIUS)
            .attr("fill", "orange");

          svg.append("text")
            .attr("x", cx)
            .attr("y", cy - MOVIE_RADIUS - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .text(movie.label);

          // Draw people around
          const people = connections[movie.id] || [];
          const angleStep = 2 * Math.PI / people.length;

          people.forEach((person, j) => {
            const angle = j * angleStep;
            const px = cx + CLUSTER_RADIUS * Math.cos(angle);
            const py = cy + CLUSTER_RADIUS * Math.sin(angle);

            svg.append("circle")
              .attr("cx", px)
              .attr("cy", py)
              .attr("r", PERSON_RADIUS)
              .attr("fill", person.role === 'actor' ? 'lightblue' : 'lightgreen')
              .attr("stroke", "#333");

            svg.append("line")
              .attr("x1", cx)
              .attr("y1", cy)
              .attr("x2", px)
              .attr("y2", py)
              .attr("stroke", "#999");

            svg.append("text")
              .attr("x", px + 10)
              .attr("y", py)
              .attr("font-size", 10)
              .text(person.label);
          });
        });
      });
  }, []);

  return <svg ref={ref}></svg>;
};

export default StudentMovieCluster;
