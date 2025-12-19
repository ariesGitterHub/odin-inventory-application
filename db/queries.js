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
          'filename', pi.filename
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
      acc[img.type].push(img.filename);
      return acc;
    }, {}),

    // Tags as a comma-separated string
    // tags: p.tags.join(", "),
    tags: p.tags,

    // Organize inventory by size_code
    inventoryBySize: p.inventory.reduce((acc, inv) => {
      acc[inv.size_code] = acc[inv.size_code] || [];
      acc[inv.size_code].push({
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

module.exports = {
  getAllProducts,
};
