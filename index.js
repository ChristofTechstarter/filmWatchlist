const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

function readFile(file) {
  const data = fs.readFileSync(file, "utf-8");
  return JSON.parse(data);
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get("/films", (req, res) => {
  try {
    const filmList = readFile("films.json");
    res.json(filmList);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server error, Please try again later!",
      errorMessage: error,
    });
  }
});

app.listen(5005, () => {
  console.log("API läuft auf Port 5005");
});
