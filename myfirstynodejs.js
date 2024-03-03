const express = require("express");
const fileUpload = require("express-fileupload");
const mysql = require("mysql2/promise");
const xlsx = require("xlsx");
const path = require("path"); // Import the 'path' module
const fs = require("fs").promises;
const cors = require("cors");

const app = express();

// Use CORS middleware
app.use(cors());

app.use(express.json());
app.use(fileUpload());

const PORT = 3000;

// MySQL database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "shreeram",
  database: "shivam",
};

// Function to read Excel file and insert data into MySQL table
async function insertExcelDataToMySQL(file) {
  try {
    const workbook = xlsx.read(file.data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const tableName = path.basename(file.name, path.extname(file.name)); // Extract table name from filename

    // Extract column names and types from the first row
    const columnDefinitions = data[0]
      .map((col) => `\`${col}\` varchar(255)`)
      .join(", ");

    const connection = await mysql.createConnection(dbConfig); // Use dbConfig for database connection

    // Create MySQL table with filename as table name
    const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefinitions})`;
    await connection.execute(createTableQuery);

    // Extract values from remaining rows
    const values = data
      .slice(1)
      .map((row) => "(" + row.map((val) => mysql.escape(val)).join(", ") + ")")
      .join(", ");

    // Insert data into MySQL table
    if (values.length > 0) {
      const insertQuery = `INSERT INTO \`${tableName}\` VALUES ${values}`;
      await connection.execute(insertQuery);
    }

    console.log("Data inserted successfully.");

    // Close MySQL connection
    await connection.end();

    return true; // Return true if data insertion is successful
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error
  }
}

// Endpoint to handle file upload
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.files.file;

    // Save uploaded file temporarily and process it
    await file.mv("./temp.xlsx");
    await insertExcelDataToMySQL(file);

    // Delete temporary file after processing
    await fs.unlink("./temp.xlsx");

    res
      .status(200)
      .json({ message: "File uploaded and processed successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred.");
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
