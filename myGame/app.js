const express = require('express');
const app = express();
const port = 3000;
const path = require('node:path');
const mysql = require('mysql');
const bodyParser = require('body-parser'); // Add body-parser middleware

// MySQL Database Connection
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cmp5360"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL Database!");
  con.query("SELECT * FROM user", function (err, result) {
    if (err) throw err;
    console.log("Sample Users:", result);
  });
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies

// Serve Static Files
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'game.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'signin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

app.get('/loadgame', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'loadGamePage.html'));
});

// --- Login Validation Route ---
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Query to validate credentials
  const query = "SELECT * FROM user WHERE email = ? AND password = ?";
  con.query(query, [email, password], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }

    if (result.length > 0) {
      // Login successful
      res.json({ success: true, message: "Login successful!" });
    } else {
      // Invalid credentials
      res.json({ success: false, message: "Invalid email or password!" });
    }
  });
});

// 404 Route - Handle undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'static', '404.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
