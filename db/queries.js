// ALL CODE THAT TALKS TO THE DATABASE GOES HERE, SO ALL SQL AND SEARCH

const pool = require("./pool");

// --- Get all products...the basic first step ---
async function getAllProducts() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.animal_type,
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

// --- Post a new product item ---
async function postNewProduct({
  animal_type,
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
        animal_type,
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
        animal_type,
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

// --- Delete a product item by id ---
async function deleteProduct(id) {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}

module.exports = {
  getAllProducts,
  postNewProduct,
  deleteProduct,
};
