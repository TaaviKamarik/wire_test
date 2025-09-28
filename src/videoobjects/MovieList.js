import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

export function MovieList({ kujund }) {
  const [data, setData] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);


  return (
    <Autocomplete
      options={data}
      sx={{ width: 300 }}
      getOptionLabel={(option) => `${option.label} (${option.count})`}
      value={selectedFilm}
      onChange={(e, newValue) => {
        if (newValue) {
          setSelectedFilm(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Vali film" margin="normal" />
      )}
      fullWidth
    />
  );
}
