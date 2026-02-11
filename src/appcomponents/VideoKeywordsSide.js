import React from 'react';
import {countsJson} from "../const/const";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';

const items = () => {
  const json = countsJson;
  const initItems = [{key: "loc", icon: <LocationOnIcon/>, label: "Locations"}, {key: "org", icon: <AccountBalanceIcon/>, label: "Organizations"},  {key: "per", icon: <PersonIcon/>, label: "Persons"}]


}

const VideoKeywordsSide = () => {
  return (
    <div>
      
    </div>
  );
};

export default VideoKeywordsSide;