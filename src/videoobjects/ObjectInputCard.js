import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Autocomplete,
} from "@mui/material";
import { keyPairs } from "../const/dataArray";

const ObjectInputCard = (
  {
    headerText,
    mainText,
    values,
    cardNo,
    setCardNo,
    element,
    setElement,
    newValueFunction = null,
    type = null
  }) => {
  const [isValid, setIsValid] = useState(!!element);
  const [inputValue, setInputValue] = useState(element || null);

  const handleValueChange = (value) => {
    setElement(value);
    setInputValue(value);
    setIsValid(!!value);
  };

  const handleContinueClick = () => {
    setCardNo(cardNo + 1);

    if (newValueFunction) {
      newValueFunction(inputValue[0]);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        minWidth: 400,
        padding: 3,
        textAlign: "center",
        borderRadius: 2,
        position: "relative",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
        {headerText}
      </Typography>

      <Typography variant="body2" sx={{ color: "gray", mt: 1, mb: 2 }}>
        {mainText}
      </Typography>

      <Autocomplete
        freeSolo
        value={inputValue}
        getOptionLabel={(option) =>
          !type ? (`${option[0].slice(4)}` + ` (${option[2]})`) : (`${option[2]}` + ` (${option[1]})`)
        }
        onChange={(event, newValue) => {
          if (newValue !== null) {
            handleValueChange(newValue);
          } else {
            handleValueChange(null);
          }
        }}
        options={values}
        renderInput={(params) => (
          <TextField {...params} label="Input value here" />
        )}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        {cardNo !== 0 && (
          <Button
            style={{ color: "#00b1bf" }}
            onClick={() => {
              setCardNo(cardNo - 1);
              setElement(null);
            }}
            variant="outlined"
          >
            Previous
          </Button>
        )}
        <Button
          sx={{
            background: "#00b1bf",
            marginLeft: "auto",
            "&.Mui-disabled": {
              background: "#eaeaea",
              color: "#c0c0c0",
            },
          }}
          variant="contained"
          color="primary"
          disabled={!isValid}
          onClick={handleContinueClick}
        >
          Continue
        </Button>
      </Box>
    </Paper>
  );
};

export default ObjectInputCard;
