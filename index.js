const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];

// Create new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: uuidv4(),
  };
  users.push(newUser);
  res.json(newUser);
});

// Get list of all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Add exercise for a user
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((user) => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };
  if (!user.log) {
    user.log = [];
  }
  user.log.push(exercise);
  res.json(user);
});

// Get exercise log of a user
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const user = users.find((user) => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  let { from, to, limit } = req.query;
  let log = user.log || [];

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    log = log.filter((exercise) => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    });
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log,
  };
  res.json(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// const express = require('express')
// const app = express()
// const cors = require('cors')
// require('dotenv').config()

// app.use(cors())
// app.use(express.static('public'))
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html')
// });

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })
