import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import {objectsData} from "../const/objectsData";

export function KeywordList({ onSelect }) {
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const formatted = objectsData.map(([code, total, films]) => ({
      label: code.substring(4), // "person", "chair", etc.
      value: code,
      total,
      films,
    }));
    setData(formatted);
    setLoading(false);
  }, []);

  return (
    <Autocomplete
      options={data}
      sx={{ width: 300 }}
      getOptionLabel={(option) => `${option.label} (${option.films})`}
      onChange={(e, newValue) => {
        if (newValue) onSelect(newValue.value);
      }}
      inputValue={inputValue}
      onInputChange={(e, value) => setInputValue(value)}
      renderInput={(params) => (
        <TextField {...params} label="Vali kujund" margin="normal" />
      )}
      fullWidth
    />
  );
}
