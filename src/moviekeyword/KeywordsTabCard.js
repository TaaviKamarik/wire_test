import React from 'react';
import {Box, List, ListItem, ListItemText, Paper} from "@mui/material";

const KeywordsTabCard = ({separatedKeywords, setVideoBookmarks, setCurrentSentence}) => {
  return (
    <Box>
      <List style={{height: "500px", width: "250px", overflow: "auto"}}>
        {separatedKeywords.map((val) => {
          return(<ListItem sx={{cursor: "pointer"}}>
            <ListItemText
              className="video-list-item"
              onClick={() => {
                setVideoBookmarks(val[1]);
                setCurrentSentence(null)
              }}
              primary={`${val[0]} (${val[1].length})`}
            />
          </ListItem>)
        })}
      </List>
    </Box>
  );
};

export default KeywordsTabCard;