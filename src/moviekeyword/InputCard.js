import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment, Autocomplete,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {countsJson} from "../const/const";
import {dataArray, keyPairs} from "../const/dataArray";

const InputCard = ({headerText, mainText, values, cardNo, setCardNo, element, setElement, newValueFunction=null}) => {
  const [isValid, setIsValid] = useState(element);

  const handleUsernameChange = (value) => {
    setElement(value);
    if (value) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleContinueClick = () => {
    setCardNo(cardNo + 1);
    if(newValueFunction) {
      newValueFunction(element);
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        padding: 3,
        textAlign: "center",
        borderRadius: 2,
        position: "relative",
      }}
    >

      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
        {headerText}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "gray", mt: 1, mb: 2 }}
      >
        {mainText}
      </Typography>

      <Autocomplete
        freeSolo
        defaultValue={element}
        getOptionLabel={(option) => keyPairs[option[0]] + ` (${option[1]})`}
        getOptionValue={(option) => option}
        onChange={(event, newValue) => {
          if(newValue !== null) {
            console.log(newValue);
            handleUsernameChange(newValue);
          } else {
            handleUsernameChange(null);
          }
        }}
        options={values}
        renderInput={(params) => <TextField {...params} label="Input value here" />}
      />

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
      >
        {cardNo !== 0 && <Button style={{color: "#00b1bf"}} onClick={() => setCardNo(cardNo - 1)} variant="outlined">Previous</Button>}
        <Button sx={{background: "#00b1bf", marginLeft: "auto",  "&.Mui-disabled": {
            background: "#eaeaea",
            color: "#c0c0c0"
          }}} variant="contained" color="primary" disabled={!isValid} onClick={handleContinueClick}>
          Continue
        </Button>
      </Box>
    </Paper>
  );
};

export default InputCard;
