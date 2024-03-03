const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // Default to port 3000 if PORT environment variable is not set

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
