const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// Serve static files
app.use(express.static("public"));

// API to get questions securely
app.get("/api/questions", (req, res) => {
  const questions = JSON.parse(fs.readFileSync("questions.json"));
  res.json(questions);
});

// Track attempts in memory (for demo)
let attempts = {};

app.post("/api/generate", (req, res) => {
  const { rollNumber } = req.body;
  
  if (attempts[rollNumber] >= 3) {
    return res.status(429).json({ error: "Max attempts reached" });
  }

  attempts[rollNumber] = (attempts[rollNumber] || 0) + 1;
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));