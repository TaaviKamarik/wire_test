import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const KeywordAccordion = ({ selectedMovieData, setVideoBookmarks, setCurrentSentence }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className="font-type navmenu-style">
          Keywords
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <bOX style={{ width: '100%' }}>
          <List style={{ maxHeight: "500px", overflow: "auto" }}>
            {selectedMovieData.keywords.map((val, index) => {
              const uniques = new Set(val[1].map(pair => JSON.stringify(pair)));
              return (
                <ListItem key={index} disablePadding>
                  <ListItemText
                    className="video-list-item"
                    onClick={() => {
                      setVideoBookmarks(val[1]);
                      setCurrentSentence(null);
                    }}
                    primary={`${val[0].replace("kw_", "")} (${uniques.size})`}
                  />
                </ListItem>
              );
            })}
          </List>
        </bOX>
      </AccordionDetails>
    </Accordion>
  );
};

export default KeywordAccordion;
