// POOL MANAGES YOUR CONNECTIONS

require("dotenv").config(); // Load environment variables

// Below is the "Pool — a managed pool of clients"; Think of Pool as having a set of reserved tables at a restaurant. The pool keeps several connections open in the background. When your app needs to run a query, it borrows a connection from the pool. When the query finishes, the connection goes back into the pool for reuse.

const { Pool } = require("pg");

const isLocal = process.env.NODE_ENV === "development" || process.env.PG_HOST === "localhost";

// All of the following properties should be read from environment variables
module.exports = new Pool({
  host: process.env.PG_HOST, // or wherever the db is hosted
  user: process.env.PG_USER,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT), // The default port
  max: 10, // Optional: max clients in the pool
  ssl: isLocal ? false : { rejectUnauthorized: false },
  family: 4,
});

