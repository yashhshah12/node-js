const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shreeram",
  database: "shivam",
});

// Function to execute query and dynamically create tables with columns
function createTables(inputs) {
  connection.query("SELECT name FROM student", (err, results) => {
    if (err) throw err;

    const columnNames = results.map((result) =>
      result.name.replace(/\s+/g, "_")
    ); // Replace spaces with underscores

    inputs.forEach((input) => {
      const createTableQuery = `CREATE TABLE IF NOT EXISTS ${input} (Date varchar(15), ${columnNames
        .map((name) => `${name} VARCHAR(255)`)
        .join(", ")})`;

      connection.query(createTableQuery, (err, results) => {
        if (err) throw err;

        console.log(
          `Table ${input} created with columns: ${columnNames.join(", ")}`
        );
      });
    });

    // Close MySQL connection
    connection.end((err) => {
      if (err) throw err;
      console.log("MySQL connection closed.");
    });
  });
}

// POST endpoint to receive input data from client
app.post("/saveSubjects", (req, res) => {
  const inputs = req.body.inputs; // Corrected variable name

  // Ensure inputs array is not empty and create tables dynamically
  if (inputs && inputs.length > 0) {
    createTables(inputs);
  } else {
    console.error("No inputs received.");
  }

  // Handle the received subjects data as needed
  console.log("Received inputs:", inputs);

  // Send response back to the client
  res.sendStatus(200); // OK
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
