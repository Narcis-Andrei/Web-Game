const express = require('express');
const app = express();
const port = 3000;
const path = require('node:path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// MySQL Database Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cmp5360"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL!!!!!!");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static'))); // Serve static files

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'signin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'game.html'));
});

// Handle Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
      // Check if the email already exists
      const checkUserQuery = "SELECT * FROM user WHERE email = ?";
      con.query(checkUserQuery, [email], async (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
              return res.status(400).send("User already exists");
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert new user
          const insertUserQuery = "INSERT INTO user (name, email, password, score) VALUES (?, ?, ?, ?)";
          con.query(insertUserQuery, [name, email, hashedPassword, 0], (err, result) => {
              if (err) throw err;
              res.status(200).send("User registered successfully");
          });
      });
  } catch (error) {
      res.status(500).send("Internal Server Error");
  }
});

// Handle Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the email exists in the database
  const checkUserQuery = "SELECT * FROM user WHERE email = ?";
  con.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Server error. Please try again later." });
      }

      if (results.length === 0) {
          return res.status(401).json({ success: false, message: "Email not found. Please register." });
      }

      // Compare the password with the hashed password
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.status(401).json({ success: false, message: "Invalid password. Please try again." });
      }

      console.log("User logged in:", user.email);
      res.status(200).json({ success: true, message: "Login successful!", user: { id: user.ID, email: user.email, name: user.name, score: user.score, health: user.health } });
  });
});

// Update Player Stats
app.post('/update-stats', (req, res) => {
  const { id, score, health } = req.body;

  if (!id || score === undefined || health === undefined) {
      return res.status(400).send("Missing parameters");
  }

  const updateStatsQuery = `
      UPDATE user
      SET score = GREATEST(score, ?), health = GREATEST(health, ?)
      WHERE ID = ?;
  `;

  con.query(updateStatsQuery, [score, health, id], (err, result) => {
      if (err) {
          console.error("Error updating stats:", err);
          return res.status(500).send("Internal Server Error");
      }

      if (result.affectedRows > 0) {
          res.status(200).send("Player stats updated successfully");
      } else {
          res.status(404).send("Player not found");
      }
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'static', '404.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
