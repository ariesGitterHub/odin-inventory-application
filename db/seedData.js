require("dotenv").config();
const { items } = require("../data/items.js");
const { Client } = require("pg");

// const items = [
//   {
//     animal_type: "alpaca",
//     item_type: "adult onesie"
//     brand: "jammy mart",
//     price_unit: 32.99,
//     cost_unit: 17.99,
//     base_sku: "alpac001jam-",
//     rating: 4.1,
//     number_reviews: 13,
//     img_front_url: "alpac001f.jpg",
//     img_rear_url: "alpac001r.jpg",
//     img_size_url: "siz_jam001.jpg",
//     tags: ["mammals, camelids"],
//     stock: [
//       { size: "S", units: 1 },
//       { size: "M", units: 0 },
//       { size: "L", units: 2 },
//       { size: "XL", units: 2 },
//     ],
//   },
// ]

// const items = [
//   {
//     animal_type: "alpaca",
//     item_type: "adult onesie",
//     brand: "jammy mart",
//     price_unit: 32.99,
//     cost_unit: 17.99,
//     base_sku: "ALPAC001JAM-",
//     rating: 4.1,
//     number_reviews: 13,
//     images: {
//       front: "alpac001f.jpg",
//       rear: "alpac001r.jpg",
//       size: "siz_jam001.jpg",
//     },
//     tags: ["mammals", "camelids"],
//     stock: [
//       { size: "S", units: 1 },
//       { size: "M", units: 0 },
//       { size: "L", units: 2 },
//       { size: "XL", units: 2 },
//     ],
//   },
// ];



async function main() {
  console.log("Seeding products...");

  const client = new Client({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
  });

  await client.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    animal_type TEXT,
    item_type TEXT,
    brand TEXT,
    price_unit NUMERIC(10,2),
    cost_unit NUMERIC(10,2),
    base_sku TEXT,
    rating NUMERIC(2,1),
    review_count INT
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    type TEXT,
    filename TEXT
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS product_tags (
    product_id INT REFERENCES products(id),
    tag_id INT REFERENCES tags(id),
    PRIMARY KEY (product_id, tag_id)
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE
  );
`);

  await client.query(`
  CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    size_id INT REFERENCES sizes(id),
    sku TEXT UNIQUE,
    units INT
  );
`);

  for (const item of items) {
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
        item.animal_type,
        item.item_type,
        item.brand,
        item.price_unit,
        item.cost_unit,
        item.base_sku,
        item.rating,
        item.number_reviews,
      ]
    );

    const productId = productRes.rows[0].id;

    /* 2️⃣ Insert images */
    for (const [type, filename] of Object.entries(item.images)) {
      await client.query(
        `
        INSERT INTO product_images (product_id, type, filename)
        VALUES ($1, $2, $3);
        `,
        [productId, type, filename]
      );
    }

    /* 3️⃣ Insert tags */
    for (const tag of item.tags) {
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

    /* 4️⃣ Insert inventory + SKUs */
    for (const { size, units } of item.stock) {
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
      const sku = `${item.base_sku}${size}`;

      //   await client.query(
      //     `
      //     INSERT INTO inventory (product_id, size_id, sku, units)
      //     VALUES ($1, $2, $3, $4);
      //     `,
      //     [productId, sizeId, sku, units]
      //   );

      // comment out above/try below ... ERROR happens if you run it multiple times without cleaning the table, or if item.base_sku + size produces the same SKU more than once.
      await client.query(
        `
        INSERT INTO inventory (product_id, size_id, sku, units)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (sku) DO UPDATE
        SET units = EXCLUDED.units,
            product_id = EXCLUDED.product_id,
            size_id = EXCLUDED.size_id;
        `,
        [productId, sizeId, sku, units]
      );
    }
  }

  await client.end();
  console.log("Product seeding complete!");
}

main().catch((err) => {
  console.error("Error seeding DB:", err);
});
