// ALL CODE THAT TALKS TO THE DATABASE GOES HERE, SO ALL SQL AND SEARCH

const pool = require("./pool");

// --- Get all products...the basic first step ---
async function getAllProducts() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.product_name,
      p.item_type,
      p.brand,
      p.price_unit,
      p.cost_unit,
      p.base_sku,
      p.rating,
      p.review_count,

      -- images
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'type', pi.type,
            'filename_or_link', pi.filename_or_link
          )
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS images,

      -- tags
      COALESCE(
        json_agg(
          DISTINCT t.name
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags,

      -- inventory
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'size', s.code,
            'sku', i.sku,
            'barcode', i.barcode,
            'units', i.units,
            'storage', i.storage
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
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

  // return result.rows.map((p) => ({
  //   ...p,

  //   // numeric safety
  //   price_unit: Number(p.price_unit),
  //   cost_unit: Number(p.cost_unit),

  //   profit_per_unit: Number(
  //     (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
  //   ),

  //   // Organizing images by type (front, rear, size)
  //   imagesByType: p.images.reduce((acc, img) => {
  //     acc[img.type] = acc[img.type] || [];
  //     acc[img.type].push(img.filename_or_link);
  //     return acc;
  //   }, {}),

  //   // Tags as a comma-separated string
  //   // tags: p.tags.join(", "),
  //   tags: p.tags,

  //   // Organize inventory by size
  //   inventoryBySize: p.inventory.reduce((acc, inv) => {
  //     acc[inv.size] = acc[inv.size] || [];
  //     acc[inv.size].push({
  //       // size: inv.size,
  //       sku: inv.sku,
  //       barcode: inv.barcode,
  //       units: inv.units,
  //       storage: inv.storage,
  //     });
  //     return acc;
  //   }, {}),

  //   // Parse JSON arrays if needed (in case they're strings)
  //   images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
  //   tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
  //   inventory:
  //     typeof p.inventory === "string" ? JSON.parse(p.inventory) : p.inventory,
  // }));

return result.rows.map((p) => {
  // Ensure arrays
  const images = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
  const tags = typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags;
  const inventory =
    typeof p.inventory === "string" ? JSON.parse(p.inventory) : p.inventory;

  // Organize images by type
  const imagesByType = images.reduce((acc, img) => {
    acc[img.type] = acc[img.type] || [];
    acc[img.type].push(img.filename_or_link);
    return acc;
  }, {});

  // Organize inventory by size
  const inventoryBySize = inventory.reduce((acc, inv) => {
    acc[inv.size] = acc[inv.size] || [];
    acc[inv.size].push({
      sku: inv.sku,
      barcode: inv.barcode,
      units: inv.units,
      storage: inv.storage,
    });
    return acc;
  }, {});

  return {
    ...p,
    price_unit: Number(p.price_unit),
    cost_unit: Number(p.cost_unit),
    profit_per_unit: Number(
      (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
    ),
    images,
    tags,
    inventory,
    imagesByType,
    inventoryBySize,
  };
});

}

// --- Get all tags for create-item.ejs ---
async function getAllTags() {
  const result = await pool.query(`
    SELECT id, name
    FROM tags
    ORDER BY name;
  `);

  return result.rows;
}

async function getProductById(productId) {
  const client = await pool.connect();
  try {
    // 1️⃣ Get main product
    const productRes = await client.query(
      `SELECT * FROM products WHERE id = $1`,
      [productId]
    );
    const product = productRes.rows[0];
    if (!product) return null;

    // 2️⃣ Get images
    const imagesRes = await client.query(
      `SELECT type, filename_or_link FROM product_images WHERE product_id = $1`,
      [productId]
    );
    product.imagesByType = {};
    imagesRes.rows.forEach((row) => {
      if (!product.imagesByType[row.type]) product.imagesByType[row.type] = [];
      product.imagesByType[row.type].push(row.filename_or_link);
    });

    // 3️⃣ Get tags
    const tagsRes = await client.query(
      `SELECT t.name
       FROM tags t
       JOIN product_tags pt ON t.id = pt.tag_id
       WHERE pt.product_id = $1`,
      [productId]
    );
    product.tags = tagsRes.rows.map((r) => r.name);

    // 4️⃣ Get inventory grouped by size
    const inventoryRes = await client.query(
      `SELECT s.code as size, i.sku, i.barcode, i.units, i.storage
       FROM inventory i
       JOIN sizes s ON i.size_id = s.id
       WHERE i.product_id = $1
       ORDER BY s.code`,
      [productId]
    );
    product.inventoryBySize = {};
    inventoryRes.rows.forEach((row) => {
      if (!product.inventoryBySize[row.size])
        product.inventoryBySize[row.size] = [];
      product.inventoryBySize[row.size].push({
        sku: row.sku,
        barcode: row.barcode,
        units: row.units,
        storage: row.storage,
      });
    });

    return product;
  } finally {
    client.release();
  }
}


// --- POST a new product item ---
async function postNewProduct({
  product_name,
  item_type,
  brand,
  price_unit,
  cost_unit,
  base_sku,
  rating,
  review_count,
  images = {},
  tags = [],
  stock = [],
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 1️⃣ Insert product */
    const productRes = await client.query(
      `
      INSERT INTO products (
        product_name,
        item_type,
        brand,
        price_unit,
        cost_unit,
        base_sku,
        rating,
        review_count
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id;
      `,
      [
        product_name,
        item_type,
        brand,
        price_unit,
        cost_unit,
        base_sku,
        rating,
        review_count,
      ]
    );

    const productId = productRes.rows[0].id;

    /* 2️⃣ Insert images */
    for (const [type, filename_or_link] of Object.entries(images)) {
      await client.query(
        `
        INSERT INTO product_images (product_id, type, filename_or_link)
        VALUES ($1, $2, $3);
        `,
        [productId, type, filename_or_link]
      );
    }

    /* 3️⃣ Insert tags */
    for (const tag of tags) {
      const tagRes = await client.query(
        `
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
        `,
        [tag]
      );

      const tagId = tagRes.rows[0].id;

      await client.query(
        `
        INSERT INTO product_tags (product_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
        [productId, tagId]
      );
    }

    /* 4️⃣ Insert inventory */
    for (const { size, barcode, units, storage } of stock) {
      const sizeRes = await client.query(
        `
        INSERT INTO sizes (code)
        VALUES ($1)
        ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
        RETURNING id;
        `,
        [size]
      );

      const sizeId = sizeRes.rows[0].id;
      const sku = `${base_sku}${size}`;

      await client.query(
        `
        INSERT INTO inventory (
          product_id,
          size_id,
          sku,
          barcode,
          units,
          storage
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (sku) DO UPDATE
        SET units = EXCLUDED.units,
            barcode = EXCLUDED.barcode,
            storage = EXCLUDED.storage,
            product_id = EXCLUDED.product_id,
            size_id = EXCLUDED.size_id;
        `,
        [productId, sizeId, sku, barcode, units, storage]
      );
    }

    await client.query("COMMIT");

    return productId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// PUT/update an item from the db
async function putUpdateProduct(
  productId,
  {
    product_name,
    item_type,
    brand,
    price_unit,
    cost_unit,
    base_sku,
    rating,
    review_count,
    images = {},
    tags = [],
    stock = [],
  }
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Update product
    await client.query(
      `
      UPDATE products SET
        product_name = $1,
        item_type = $2,
        brand = $3,
        price_unit = $4,
        cost_unit = $5,
        base_sku = $6,
        rating = $7,
        review_count = $8
      WHERE id = $9;
      `,
      [
        product_name,
        item_type,
        brand,
        price_unit,
        cost_unit,
        base_sku,
        rating,
        review_count,
        productId,
      ]
    );

    // 2️⃣ Images
    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [
      productId,
    ]);
    for (const [type, filename_or_link] of Object.entries(images)) {
      await client.query(
        `
        INSERT INTO product_images (product_id, type, filename_or_link)
        VALUES ($1, $2, $3);
        `,
        [productId, type, filename_or_link]
      );
    }

    // 3️⃣ Tags
    await client.query(`DELETE FROM product_tags WHERE product_id = $1`, [
      productId,
    ]);
    for (const tag of tags) {
      const tagRes = await client.query(
        `
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
        `,
        [tag]
      );

      await client.query(
        `
        INSERT INTO product_tags (product_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
        [productId, tagRes.rows[0].id]
      );
    }

    // 4️⃣ Inventory
    for (const { size, barcode, units, storage } of stock) {
      const sizeRes = await client.query(
        `
        INSERT INTO sizes (code)
        VALUES ($1)
        ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
        RETURNING id;
        `,
        [size]
      );

      const sizeId = sizeRes.rows[0].id;
      const sku = `${base_sku}${size}`;

      await client.query(
        `
        INSERT INTO inventory (
          product_id,
          size_id,
          sku,
          barcode,
          units,
          storage
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (sku) DO UPDATE
        SET units = EXCLUDED.units,
            barcode = EXCLUDED.barcode,
            storage = EXCLUDED.storage,
            product_id = EXCLUDED.product_id,
            size_id = EXCLUDED.size_id;
        `,
        [productId, sizeId, sku, barcode, units, storage]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}


// NOT USING THIS..buggy on put. UPSERT/combo post/put -  this allows me to combine insert and update into one, BUT this works for POST of new products but not for PUT updates. Go back to basics and separate out POST and PUT from queries to controllers to routes...
// async function upsertProduct({
//   productId = null, // optional
//   product_name,
//   item_type,
//   brand,
//   price_unit,
//   cost_unit,
//   base_sku,
//   rating,
//   review_count,
//   images = {},
//   tags = [],
//   stock = [],
// }) {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     /* 1️⃣ Insert or update product */
//     if (productId) {
//       // UPDATE existing product
//       await client.query(
//         `
//         UPDATE products
//         SET product_name = $1,
//             item_type = $2,
//             brand = $3,
//             price_unit = $4,
//             cost_unit = $5,
//             base_sku = $6,
//             rating = $7,
//             review_count = $8
//         WHERE id = $9
//         `,
//         [
//           product_name,
//           item_type,
//           brand,
//           price_unit,
//           cost_unit,
//           base_sku,
//           rating,
//           review_count,
//           productId,
//         ]
//       );
//     } else {
//       // INSERT new product
//       const productRes = await client.query(
//         `
//         INSERT INTO products (
//           product_name,
//           item_type,
//           brand,
//           price_unit,
//           cost_unit,
//           base_sku,
//           rating,
//           review_count
//         )
//         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//         RETURNING id;
//         `,
//         [
//           product_name,
//           item_type,
//           brand,
//           price_unit,
//           cost_unit,
//           base_sku,
//           rating,
//           review_count,
//         ]
//       );
//       productId = productRes.rows[0].id;
//     }

//     /* 2️⃣ Upsert images */
//     // Delete old images if updating
//     if (images && Object.keys(images).length && productId) {
//       await client.query(`DELETE FROM product_images WHERE product_id = $1`, [
//         productId,
//       ]);
//     }

//     for (const [type, filename_or_link] of Object.entries(images)) {
//       await client.query(
//         `INSERT INTO product_images (product_id, type, filename_or_link)
//          VALUES ($1, $2, $3)`,
//         [productId, type, filename_or_link]
//       );
//     }

//     /* 3️⃣ Upsert tags */
//     if (tags && tags.length && productId) {
//       await client.query(`DELETE FROM product_tags WHERE product_id = $1`, [
//         productId,
//       ]);
//     }

//     for (const tag of tags) {
//       const tagRes = await client.query(
//         `
//         INSERT INTO tags (name)
//         VALUES ($1)
//         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
//         RETURNING id;
//         `,
//         [tag]
//       );
//       const tagId = tagRes.rows[0].id;

//       await client.query(
//         `INSERT INTO product_tags (product_id, tag_id)
//          VALUES ($1, $2)
//          ON CONFLICT DO NOTHING`,
//         [productId, tagId]
//       );
//     }

//     /* 4️⃣ Upsert inventory */
//     for (const { size, barcode, units, storage } of stock) {
//       const sizeRes = await client.query(
//         `INSERT INTO sizes (code)
//          VALUES ($1)
//          ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
//          RETURNING id`,
//         [size]
//       );
//       const sizeId = sizeRes.rows[0].id;
//       const sku = `${base_sku}${size}`;

//       await client.query(
//         `
//         INSERT INTO inventory (product_id, size_id, sku, barcode, units, storage)
//         VALUES ($1, $2, $3, $4, $5, $6)
//         ON CONFLICT (sku) DO UPDATE
//         SET units = EXCLUDED.units,
//             barcode = EXCLUDED.barcode,
//             storage = EXCLUDED.storage,
//             product_id = EXCLUDED.product_id,
//             size_id = EXCLUDED.size_id
//         `,
//         [productId, sizeId, sku, barcode, units, storage]
//       );
//     }

//     await client.query("COMMIT");

//     return productId;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// }


// --- Delete a product item by id ---
async function deleteProduct(id) {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}

module.exports = {
  getAllProducts,
  getAllTags,
  getProductById,
  postNewProduct,
  putUpdateProduct,
  // upsertProduct,
  deleteProduct,
};
