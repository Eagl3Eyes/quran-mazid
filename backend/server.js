const express = require("express");
const cors = require("cors");
const quranRoutes = require("./routes/quranRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[BACKEND] ${req.method} ${req.url}`);
  next();
});

// Status route
app.get("/", (req, res) => {
  res.send("Quran Mazid API Backend is running...");
});

// API Routes
app.use("/api", quranRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
