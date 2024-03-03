const mysql = require("mysql2");

// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shreeram",
  database: "shivam",
});

// Inputs from the user
const inputs = ["PWP", "MAD", "NIS"];

// Function to execute query and dynamically create tables with columns
function createTables() {
  connection.query("SELECT name FROM checking", (err, results) => {
    if (err) throw err;

    const columnNames = results.map((result) =>
      result.name.replace(/\s+/g, "_")
    ); // Replace spaces with underscores

    inputs.forEach((input) => {
      const createTableQuery = `CREATE TABLE IF NOT EXISTS ${input} (Date varchar(15),${columnNames
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

// Execute createTables function
createTables();
