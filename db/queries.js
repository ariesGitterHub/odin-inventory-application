// ALL CODE THAT TALKS TO THE DATABASE GOES HERE, SO ALL SQL AND SEARCH

const pool = require("./pool");

// async function getProducts() {
//   const result = await pool.query(`
//     SELECT id, animal_type, item_type, brand, price_unit, cost_unit, base_sku, rating, review_count
//     FROM products
//     ORDER BY id;
//   `);
//   return result.rows;
// }

// async function getProductById(id) {
//   const result = await pool.query(
//     `SELECT * FROM products WHERE id = $1`,
//     [id]);
//   return result.rows[0]; // single product
// }

// module.exports = {
//     getProducts
// };

// const pool = require("./pool");


// TODO - understand this better!
// version 1
// async function getAllProducts() {
//   const result = await pool.query(`
//     SELECT 
//       p.*,
//       COALESCE(
//         json_agg(DISTINCT jsonb_build_object(
//           'type', pi.type,
//           'filename', pi.filename
//         )) FILTER (WHERE pi.id IS NOT NULL), '[]'
//       ) AS images,
//       COALESCE(
//         json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]'
//       ) AS tags,
//       COALESCE(
//         json_agg(DISTINCT jsonb_build_object(
//           'size_code', s.code,
//           'sku', i.sku,
//           'units', i.units
//         )) FILTER (WHERE i.id IS NOT NULL), '[]'
//       ) AS inventory
//     FROM products p
//     LEFT JOIN product_images pi ON pi.product_id = p.id
//     LEFT JOIN product_tags pt ON pt.product_id = p.id
//     LEFT JOIN tags t ON t.id = pt.tag_id
//     LEFT JOIN inventory i ON i.product_id = p.id
//     LEFT JOIN sizes s ON s.id = i.size_id
//     GROUP BY p.id
//     ORDER BY p.id;
//   `);

//   return result.rows.map((p) => ({
//     ...p,
//     // compute profit safely
//     // profit_per_unit: Number(
//     //   (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
//     // ),
//     images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
//     tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
//     inventory:
//       typeof p.inventory === "string" ? JSON.parse(p.inventory) : p.inventory,
//   }));
// }

// version 2
async function getAllProducts() {
  const result = await pool.query(`
    SELECT 
      p.*,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'type', pi.type,
          'filename_or_link', pi.filename_or_link
        )) FILTER (WHERE pi.id IS NOT NULL), '[]'
      ) AS images,
      COALESCE(
        json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS tags,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'size_code', s.code,
          'sku', i.sku,
          'barcode', i.barcode,
          'units', i.units,
          'storage', i.storage
        )) FILTER (WHERE i.id IS NOT NULL), '[]'
      ) AS inventory
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    LEFT JOIN product_tags pt ON pt.product_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    LEFT JOIN inventory i ON i.product_id = p.id
    LEFT JOIN sizes s ON s.id = i.size_id
    GROUP BY p.id
    ORDER BY p.id;
  `);

  return result.rows.map((p) => ({
    ...p,
    profit_per_unit: Number(
      (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
    ),

    // Organizing images by type (front, rear, size)
    imagesByType: p.images.reduce((acc, img) => {
      acc[img.type] = acc[img.type] || [];
      acc[img.type].push(img.filename_or_link);
      return acc;
    }, {}),

    // Tags as a comma-separated string
    // tags: p.tags.join(", "),
    tags: p.tags,

    // Organize inventory by size_code
    inventoryBySize: p.inventory.reduce((acc, inv) => {
      acc[inv.size_code] = acc[inv.size_code] || [];
      acc[inv.size_code].push({
        // size: inv.size_code,
        sku: inv.sku,
        barcode: inv.barcode,
        units: inv.units,
        storage: inv.storage,
      });
      return acc;
    }, {}),

    // Parse JSON arrays if needed (in case they're strings)
    images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
    tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
    inventory:
      typeof p.inventory === "string" ? JSON.parse(p.inventory) : p.inventory,
  }));
}

// async function postNewProduct({
//   animal_type,
//   item_type,
//   brand,
//   price_unit,
//   cost_unit,
//   base_sku,
//   rating,
//   review_count,
//   images, // images is now an object with { front, rear, size }
// }) {
//   const client = await pool.connect(); // Get a client from the pool for transaction
//   try {
//     // Start a transaction
//     await client.query("BEGIN");

//     // Step 1: Insert into the `products` table
//     const insertProductQuery = `INSERT INTO products (animal_type, item_type, brand, price_unit, cost_unit, base_sku, rating, review_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//     RETURNING id;`;

//     const values = [
//       animal_type,
//       item_type,
//       brand,
//       price_unit,
//       cost_unit,
//       base_sku,
//       rating,
//       review_count,
//     ];

//     const { rows } = await pool.query(insertProductQuery, values);
//     const productId = rows[0].id; // Get the inserted product's ID

//     // Step 2: Insert related images into the `product_images` table
//     // Loop through the images object and insert each image type and filename
//     const insertImageQuery = `
//       INSERT INTO product_images (product_id, type, filename_or_link)
//       VALUES ($1, $2, $3)
//     `;

//     // Loop through the keys of the images object (e.g., front, rear, size)
//     for (const [type, filename_or_link] of Object.entries(images)) {
//       await client.query(insertImageQuery, [productId, type, filename_or_link]);
//     }

//     // Commit the transaction
//     await client.query("COMMIT");

//     return { id: productId, images };
//   } catch (error) {
//     // If any error occurs, rollback the transaction
//     await client.query("ROLLBACK");
//     throw error; // Re-throw the error to handle it elsewhere
//   } finally {
//     // Release the client back to the pool
//     client.release();
//   }
// }

// --- Delete a product by id ---
async function deleteProduct(id) {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}

module.exports = {
  getAllProducts,
  // postNewProduct,
  deleteProduct,
};
