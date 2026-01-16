
const {
  getAllProducts,
  // getSearchProducts,
  // getFilterOptions,
  getProductById,
  getAllTags,
  postNewProduct,
  putUpdateProduct,
  // upsertProduct,
  deleteProduct,
} = require("../db/queries");

const { computeProfit } = require("../helpers/profitHelper");
const normalizeProductForm = require("../helpers/normalizeProductForm");


// Error messages

// Validation array

// Item Type

// Brand

// Base SKU

// Price per unit

// Cost per unit

// Filename or link

async function getProductsPage(req, res, next) {
  try {
    const products = await getAllProducts();
    const productsWithProfit = computeProfit(products);
    res.render("index", { products: productsWithProfit });
    // res.render("index", { products });
  } catch (err) {
    next(err);
  }
}

// async function getSearchesOnProductsPage(req, res, next) {
//   try {
//     const search = req.query.q?.trim();

//     const products = await getSearchProducts({
//       search: search || null,
//     });

//     res.render("index", {
//       products,
//       search,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getSearchesOnProductsPage(req, res, next) {
//   try {
//     console.log("RAW q:", req.query.q);

//     const search = req.query.q?.trim();
//     // console.log("TRIMMED search:", search);

//     const products = await getSearchProducts({
//       search: search || null,
//     });

//     const filters = await getFilterOptions();

//     // console.log("PRODUCTS COUNT:", products?.length);

//     res.render("index", {
//       products,
//       search,
//       filterOptions: filters, // <-- new
//     });
//   } catch (err) {
//     // console.error("Error in getSearchesOnProductsPage:", err);
//     next(err);
//   }
// }

// async function getSearchesOnProductsPage(req, res, next) {
//   try {
//     // 1. Read filters from query string
//     const filters = {
//       search: req.query.q?.trim() || null,
//       brand: req.query.brand,
//       price_min: req.query.price_min,
//       price_max: req.query.price_max,
//       cost_min: req.query.cost_min,
//       cost_max: req.query.cost_max,
//       profit_min: req.query.profit_min,
//       profit_max: req.query.profit_max,
//       rating_min: req.query.rating_min,
//       rating_max: req.query.rating_max,
//       review_min: req.query.review_min,
//       review_max: req.query.review_max,
//     };

//     // 2. Fetch products (filtered)
//     const products = await getSearchProducts(filters);

//     // 3. Fetch filter UI data (always full set)
//     const filterOptions = await getFilterOptions();

//     // 4. Render page
//     res.render("index", {
//     // res.render("header", {
//     // res.render("search-filter-box", {
//       products,
//       search: filters.search,
//       filterOptions,
//       activeFilters: filters, // so EJS can keep checkboxes checked
//     });
//   } catch (err) {
//     next(err);
//   }
// }



async function getCreateItemPage(req, res, next) {
  try {
    const tags = await getAllTags();
    res.render("create-item", {
      tags,
    });
  } catch (err) {
    next(err);
  }
}

// async function postNewProductItem(req, res, next) {
//   try {
//     await postNewProduct(req.body);
//     res.redirect("/");
//   } catch (err) {
//     next(err);
//   }
// }

// postNewProduct() needs to be altered to receive structured images, clean tags[], and validated stock[]. 

// async function postNewProductItem(req, res, next) {
//   try {
//     const {
//       product_name,
//       item_type,
//       brand,
//       price_unit,
//       cost_unit,
//       base_sku,
//       rating,
//       review_count,
//       front,
//       rear,
//       size,
//       tags,
//       sizes,
//       barcodes,
//       units,
//       storage,
//     } = req.body;

//     // ✅ images object
//     const images = {};
//     if (front) images.front = front;
//     if (rear) images.rear = rear;
//     if (size) images.size = size;

//     // ✅ tags array
//     const tagList = tags
//       ? tags
//           .split(",")
//           .map((t) => t.trim())
//           .filter(Boolean)
//       : [];

//     // ✅ stock (empty for now)
//     const stock = [];

//     if (sizes) {
//       const sizeArr = [].concat(sizes);
//       const barcodeArr = [].concat(barcodes);
//       const unitArr = [].concat(units);
//       const storageArr = [].concat(storage);

//       for (let i = 0; i < sizeArr.length; i++) {
//         stock.push({
//           size: sizeArr[i],
//           barcode: barcodeArr[i],
//           units: Number(unitArr[i]) || 0,
//           storage: storageArr[i],
//         });
//       }
//     }

//     await postNewProduct({
//     // await upsertProduct({
//       product_name,
//       item_type,
//       brand,
//       price_unit,
//       cost_unit,
//       base_sku,
//       rating,
//       review_count,
//       images,
//       tags: tagList,
//       stock,
//     });

//     res.redirect("/");
//   } catch (err) {
//     next(err);
//   }
// }

// NOTE - use the helper normalizeProductForm that both POST and PUT controllers will use, it will make both more readable and keep me D.R.Y.

async function postNewProductItem(req, res, next) {
  try {
    // helper in action below
    const data = normalizeProductForm(req.body);

    await postNewProduct(data);

    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

async function getUpdateForm(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    res.render("update-item", { product });
  } catch (err) {
    next(err);
  }
};

// async function putUpdateProduct (req, res, next) {
//   try {
//     // await updateProduct(req.params.id, req.body);
//     await putUpdateProduct(req.params.id, req.body);
//     res.redirect("/");
//   } catch (err) {
//     next(err);
//   }
// };

async function putUpdateProductItem(req, res, next) {
  try {
    // helper in action below
    const data = normalizeProductForm(req.body);

    await putUpdateProduct(req.params.id, data);

    // res.redirect(`/products/${req.params.id}`);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

// DELETE product item
async function deleteProductItem(req, res, next) {
  try {
    await deleteProduct(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

async function getUnderConstructionPage(req, res, next) {
  try {
    res.render("under-construction");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductsPage,
  // getCreateItemPage,
  // postCreateItemPage,
  // getSearchesOnProductsPage,
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProductItem,
  deleteProductItem,
  getUnderConstructionPage,
};
