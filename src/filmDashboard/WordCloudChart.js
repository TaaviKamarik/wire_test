import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Wordcloud } from "@visx/wordcloud";

function getWordCounts(scenes) {
  const counts = {};
  scenes.forEach((s) => {
    (s.keywords || []).forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
    (s.actions || []).forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([text, value]) => ({ text, value }));
}

const colors = ["#00b1bf", "#7CB9E8", "#E32636", "#FFD700", "#888"];

export default function WordCloudChart({ scenes }) {
  const words = useMemo(() => getWordCounts(scenes), [scenes]);
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Keywords & Actions Word Cloud
        </Typography>
        <div style={{ height: 250, width: "100%" }}>
          <Wordcloud
            words={words}
            width={500}
            height={250}
            fontSize={(w) => 16 + (w.value || 1) * 4}
            font={"Arial"}
            padding={2}
            spiral="archimedean"
            rotate={(w) => (Math.random() > 0.5 ? 0 : 90)}
            random={Math.random}
            fill={(w) => colors[w.text.length % colors.length]}
          >
            {(cloudWords) => (
              <g>
                {cloudWords.map((word, i) => (
                  <text
                    key={word.text + i}
                    textAnchor="middle"
                    transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                    fontSize={word.size}
                    fontFamily="Arial"
                    fill={colors[word.text.length % colors.length]}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {word.text}
                  </text>
                ))}
              </g>
            )}
          </Wordcloud>
        </div>
      </CardContent>
    </Card>
  );
}
