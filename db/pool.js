// POOL MANAGES YOUR CONNECTIONS

// require("dotenv").config(); // Load environment variables

// // Below is the "Pool — a managed pool of clients"; Think of Pool as having a set of reserved tables at a restaurant. The pool keeps several connections open in the background. When your app needs to run a query, it borrows a connection from the pool. When the query finishes, the connection goes back into the pool for reuse.

// const { Pool } = require("pg");

// let pool;

// if (process.env.DATABASE_URL) {
//   // Production / Render / Neon
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false },
//   });
// } else {
//   // Local development
//   pool = new Pool({
//     host: process.env.PG_HOST || "localhost",
//     user: process.env.PG_USER,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: Number(process.env.PG_PORT) || 5432,
//     ssl: false,
//   });
// }

// module.exports = pool;

// TEST for Render

// require("dotenv").config();
// const { Pool } = require("pg");

// module.exports = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// DUAL SET UP FOR DEV AND PROD
require("dotenv").config();
const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

let pool;

if (isProd) {
  // Production: use Neon DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });
} else {
  // Development: use local Postgres
  pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
  });
}

module.exports = pool;
