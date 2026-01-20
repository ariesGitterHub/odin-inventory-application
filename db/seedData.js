require("dotenv").config();
const pool = require("./pool");
const { items } = require("../data/items.js");

async function main() {
  console.log("Seeding products...");

  try {
    await pool.query(`DROP TABLE IF EXISTS inventory;`);
    await pool.query(`DROP TABLE IF EXISTS product_tags;`);
    await pool.query(`DROP TABLE IF EXISTS product_images;`);
    await pool.query(`DROP TABLE IF EXISTS sizes;`);
    await pool.query(`DROP TABLE IF EXISTS tags;`);
    await pool.query(`DROP TABLE IF EXISTS products;`);

    await pool.query(`
      CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      product_name TEXT,
      item_type TEXT,
      brand TEXT,
      price_unit NUMERIC(10,2),
      cost_unit NUMERIC(10,2),
      base_sku TEXT,
      rating NUMERIC(2,1),
      review_count INT
      );
    `);

    await pool.query(`
  CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE
  );
`);

    await pool.query(`
  CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE
  );
`);

    await pool.query(`
  CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    type TEXT,
    filename_or_link TEXT
  );
`);

    await pool.query(`
  CREATE TABLE product_tags (
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
  );
`);

    await pool.query(`
  CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    size_id INT REFERENCES sizes(id),
    sku TEXT UNIQUE,
    barcode TEXT,
    units INT,
    storage TEXT
  );
`);

    for (const item of items) {
      await pool.query("BEGIN");

      try {
        /* Insert product */
        const productRes = await pool.query(
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
            item.product_name,
            item.item_type,
            item.brand,
            item.price_unit,
            item.cost_unit,
            item.base_sku,
            item.rating,
            item.number_reviews,
          ],
        );

        const productId = productRes.rows[0].id;

        /* Insert tags */
        for (const tag of item.tags) {
          const tagRes = await pool.query(
            `
        INSERT INTO tags (name)
        VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
        `,
            [tag],
          );

          const tagId = tagRes.rows[0].id;

          await pool.query(
            `
        INSERT INTO product_tags (product_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
            [productId, tagId],
          );
        }

        /* Insert images */
        for (const [type, filename_or_link] of Object.entries(item.images)) {
          await pool.query(
            `
        INSERT INTO product_images (product_id, type, filename_or_link)
        VALUES ($1, $2, $3);
        `,
            [productId, type, filename_or_link],
          );
        }

        /* Insert inventory + SKUs */
        for (const { size, barcode, units, storage } of item.stock) {
          const sizeRes = await pool.query(
            `
        INSERT INTO sizes (code)
        VALUES ($1)
        ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
        RETURNING id;
        `,
            [size],
          );

          const sizeId = sizeRes.rows[0].id;
          const sku = `${item.base_sku}${size}`.toUpperCase();

          await pool.query(
            `
        INSERT INTO inventory (product_id, size_id, sku, barcode, units, storage)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (sku) DO UPDATE
        SET units = EXCLUDED.units,
            barcode = EXCLUDED.barcode,
            storage = EXCLUDED.storage,
            product_id = EXCLUDED.product_id,
            size_id = EXCLUDED.size_id; 
        `,
            [productId, sizeId, sku, barcode, units, storage],
          );
        }
        // All inserts for THIS item succeeded
        await pool.query("COMMIT");
      } catch (err) {
        // Something failed for THIS item
        await pool.query("ROLLBACK");
        console.error("Failed seeding item:", item.base_sku, err.message);
        throw err; // Stops seeding and surface the error
      }
    }
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    await pool.end();
    console.log("Product seeding complete.");
  }
}

main().catch((err) => {
  console.error("Error seeding DB:", err);
});
