import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import KeywordsTabCard from "./KeywordsTabCard";
import {Paper} from "@mui/material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const keywordSections = [
  { label: "Keywords", key: "kw" },
  { label: "Locations", key: "loc" },
  { label: "Organisations", key: "org" },
  { label: "Persons", key: "per" },
  { label: "Verbs", key: "verb" },
];


export default function VerticalTabsKeywords({separatedKeywords, setCurrentSentence, setVideoBookmarks}) {
  const [value, setValue] = React.useState(0);

  const visibleSections = keywordSections.filter(section => separatedKeywords[section.key]?.length > 0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  console.log("separatedKeywords", separatedKeywords);

  return (
    <Paper
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxHeight: 500, marginTop: "1rem" }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        {visibleSections.map((section, index) => (
          <Tab key={section.key} label={section.label} {...a11yProps(index)} />
        ))}
      </Tabs>
      {visibleSections.map((section, index) => (
        <TabPanel key={section.key} value={value} index={index}>
          <KeywordsTabCard
            setVideoBookmarks={setVideoBookmarks}
            setCurrentSentence={setCurrentSentence}
            separatedKeywords={separatedKeywords[section.key]}
          />
        </TabPanel>
      ))}
    </Paper>
  );
}
