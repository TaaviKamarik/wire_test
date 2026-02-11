const fs = require("fs");
const path = require("path");

// Directory containing all your JSON files
const inputDir = "./movie_jsons";
const outputFile = "./public/all_movies.json";

const allMovies = [];

// Read all JSON files
fs.readdirSync(inputDir).forEach((file) => {
  if (file.endsWith(".json")) {
    const filePath = path.join(inputDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    allMovies.push(data);
  }
});

// Write combined file
fs.writeFileSync(outputFile, JSON.stringify(allMovies));
console.log(`Combined ${allMovies.length} movies into ${outputFile}`);
console.log(
  `File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`
);
