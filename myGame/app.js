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
app.use(express.static(path.join(__dirname, 'static')));

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

// Leaderboard API Endpoint
app.get('/leaderboard', (req, res) => {
  const query = `
      SELECT name, score 
      FROM cmp5360.user 
      WHERE name IS NOT NULL AND score IS NOT NULL 
      ORDER BY score DESC
  `;

  console.log("Executing query:", query);

  con.query(query, (err, results) => {
      if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Internal Server Error", details: err.message });
      }

      console.log("Query results:", results);
      res.json(results);
  });
});


// Handle Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkUserQuery = "SELECT * FROM user WHERE email = ?";
    con.query(checkUserQuery, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error", details: err.message });
      }

      if (result.length > 0) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery = "INSERT INTO user (name, email, password, score) VALUES (?, ?, ?, ?)";
      con.query(insertUserQuery, [name, email, hashedPassword, 0], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Database error", details: err.message });
        }

        res.status(200).json({ success: true, message: "Registration successful" });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unexpected error", details: error.message });
  }
});

// Handle Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const checkUserQuery = "SELECT * FROM user WHERE email = ?";
  con.query(checkUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Email not found" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    console.log(`User logged in: ${user.ID}`);
    return res.json({ success: true, message: "Login successful", userId: user.ID });
  });
});

// Get Current Score for Player
app.get('/get-score', (req, res) => {
  const { id } = req.query;

  if (!id) {
      console.error("Missing player ID");
      return res.status(400).json({ success: false, message: "Missing player ID" });
  }

  const query = "SELECT score FROM user WHERE ID = ?";
  con.query(query, [id], (err, results) => {
      if (err) {
          console.error("Error fetching score:", err);
          return res.status(500).json({ success: false, message: "Server error" });
      }

      if (results.length === 0) {
          return res.status(404).json({ success: false, message: "Player not found" });
      }

      res.json({ success: true, score: results[0].score });
  });
});

// Update Player Stats
app.post('/update-score', (req, res) => {
  console.log("Request received at /update-score:", req.body);

  const { id, score } = req.body;

  if (!id || score == null) {
    console.error("Missing parameters");
    return res.status(400).send("Missing parameters");
  }

  const query = `
    UPDATE user
    SET score = GREATEST(score, ?)
    WHERE ID = ?;
  `;

  con.query(query, [score, id], (err, result) => {
    if (err) {
      console.error("Error updating score:", err);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Database update result:", result);

    if (result.affectedRows > 0) {
      res.status(200).send("Score updated successfully");
    } else {
      res.status(404).send("User not found");
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
