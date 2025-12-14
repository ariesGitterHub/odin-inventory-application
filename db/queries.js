// ALL CODE THAT TALKS TO THE DATABASE GOES HERE, SO ALL SQL AND SEARCH

const pool = require("./pool");


// // --- Get all products ---
// async function getProducts() {
//   const { rows } = await pool.query(
//     "SELECT * FROM products ORDER BY id"
//   );
//   return rows;
// }

async function getProductById(id) {
  const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
  return result.rows[0]; // single product
}

module.exports = {
  getProductById,
};
