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
  console.log("Connected to MySQL Database!");
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
      con.query(checkUserQuery, [email], async (err, results) => {
          if (err) {
              console.error("Error checking email:", err);
              return res.status(500).send("Database error.");
          }

          if (results.length > 0) {
              return res.send("<h2>Email already registered. Please <a href='/login'>log in</a> instead.</h2>");
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert new user into the database
          const insertUserQuery = "INSERT INTO user (name, email, password, score) VALUES (?, ?, ?, ?)";
          con.query(insertUserQuery, [name, email, hashedPassword, 0], (err, result) => {
              if (err) {
                  console.error("Error inserting user:", err);
                  return res.status(500).send("Error saving the user to the database.");
              }

              console.log("User registered successfully:", result);
              res.redirect('/login'); // Redirect to login page
          });
      });
  } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("An error occurred during registration.");
  }
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the email exists
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
      return res.json({ success: true, message: "Login successful!" });
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'static', '404.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
