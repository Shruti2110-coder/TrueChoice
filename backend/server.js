const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');
const cors = require('cors');
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 8000;



// routes
const userRoutes =  require('./routes/userRoutes');
const candidateRoute = require('./routes/candidateRoute');
app.use('/user', userRoutes);
app.use('/candidate', candidateRoute);

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});

app.listen(PORT, () => {
    console.log("Listening on port", PORT);
});
