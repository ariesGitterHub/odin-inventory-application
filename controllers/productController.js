const { validationResult } = require("express-validator");
const {
  getAllSearchFilterProducts,
  getFilterOptions,
  getProductById,
  getAllTags,
  postNewProduct,
  putUpdateProduct,
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

// OLD - replace with new controller for new features of search and filter

// async function getProductsPage(req, res, next) {
//   try {
//     // const products = await getAllProducts();
//     const products = await getAllSearchFilterProducts();
//     const productsWithProfit = computeProfit(products);
//     res.render("index", { products: productsWithProfit });
//     // res.render("index", { products });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getProductsPage(req, res, next) {
//   try {
//     // Extract filters from query string
//     const filters = {
//       search: req.query.q || null,
//       brand: req.query.brand || null,
//       price_min: req.query.price_min ? Number(req.query.price_min) : null,
//       price_max: req.query.price_max ? Number(req.query.price_max) : null,
//       cost_min: req.query.cost_min ? Number(req.query.cost_min) : null,
//       cost_max: req.query.cost_max ? Number(req.query.cost_max) : null,
//       profit_min: req.query.profit_min ? Number(req.query.profit_min) : null,
//       profit_max: req.query.profit_max ? Number(req.query.profit_max) : null,
//       rating_min: req.query.rating_min ? Number(req.query.rating_min) : null,
//       rating_max: req.query.rating_max ? Number(req.query.rating_max) : null,
//       review_min: req.query.review_min ? Number(req.query.review_min) : null,
//       review_max: req.query.review_max ? Number(req.query.review_max) : null,
//     };

//     // If only one brand is selected, ensure it's an array for consistency
//     if (filters.brand && !Array.isArray(filters.brand)) {
//       filters.brand = [filters.brand];
//     }

//     const products = await getAllSearchFilterProducts(filters);
//     const productsWithProfit = computeProfit(products); // optional if you want extra processing

//     const filterOptions = await getFilterOptions(); // ← needed for partial

//     res.render("index", {
//       products: productsWithProfit,
//       search: filters.search,
//       activeFilters: filters,
//       filterOptions,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

async function getProductsPage(req, res, next) {
  try {
    const isFilteredList = req.path === "/list";

    const filters = isFilteredList
      ? {
          search: req.query.q || null,
          brand: req.query.brand || null,
          price_min: req.query.price_min ? Number(req.query.price_min) : null,
          price_max: req.query.price_max ? Number(req.query.price_max) : null,
          cost_min: req.query.cost_min ? Number(req.query.cost_min) : null,
          cost_max: req.query.cost_max ? Number(req.query.cost_max) : null,
          profit_min: req.query.profit_min
            ? Number(req.query.profit_min)
            : null,
          profit_max: req.query.profit_max
            ? Number(req.query.profit_max)
            : null,
          rating_min: req.query.rating_min
            ? Number(req.query.rating_min)
            : null,
          rating_max: req.query.rating_max
            ? Number(req.query.rating_max)
            : null,
          review_min: req.query.review_min
            ? Number(req.query.review_min)
            : null,
          review_max: req.query.review_max
            ? Number(req.query.review_max)
            : null,
        }
      : {};

    if (isFilteredList && filters.brand && !Array.isArray(filters.brand)) {
      filters.brand = [filters.brand];
    }

    const products = isFilteredList
      ? await getAllSearchFilterProducts(filters)
      : await getAllSearchFilterProducts({});

    const productsWithProfit = computeProfit(products);
    const filterOptions = await getFilterOptions();

    res.render("index", {
      products: productsWithProfit,
      search: isFilteredList ? filters.search : "",
      activeFilters: isFilteredList ? filters : {},
      filterOptions,
    });
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
      // filterOptions: { brands: [], price: [], rating: [] },
      // activeFilters: {},
    });
  } catch (err) {
    next(err);
  }
}

// NOTE - use the helper normalizeProductForm that both POST and PUT controllers will use, it will make both more readable and keep me D.R.Y.

// async function postNewProductItem(req, res, next) {
//   try {
//     // helper in action below
//     const data = normalizeProductForm(req.body);

//     await postNewProduct(data);

//     res.redirect("/products");
//   } catch (err) {
//     next(err);
//   }
// }

async function postNewProductItem(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Re-render the form with validation errors
      return res.status(422).render("create-item", {
        errors: errors.array(), // array of error messages
        oldInput: req.body, // pre-fill form
      });
    }

    // No validation errors, proceed as normal
    const data = normalizeProductForm(req.body);
    await postNewProduct(data);

    res.redirect("/products");
  } catch (err) {
    next(err);
  }
}

async function getUpdateForm(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    res.render("update-item", {
      product,
      // filterOptions: { brands: [], price: [], rating: [] },
      // activeFilters: {},
    });
  } catch (err) {
    next(err);
  }
}

// async function putUpdateProductItem(req, res, next) {
//   try {
//     // helper in action below
//     const data = normalizeProductForm(req.body);

//     await putUpdateProduct(req.params.id, data);

//     // res.redirect(`/products/${req.params.id}`);
//     res.redirect("/products");
//   } catch (err) {
//     next(err);
//   }
// }

async function putUpdateProductItem(req, res, next) {
  try {
    // 1. Validate ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).send("Invalid product ID");
    }

    // 2. Validation errors (reuse express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("update-item", {
        errors: errors.array(),
        product: { id, ...req.body },
      });
    }

    // 3. Ensure product exists
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    // 4. Whitelist allowed fields
    const allowedFields = [
      "name",
      "brand",
      "price",
      "cost",
      "quantity",
      "tags",
      "filename",
    ];

    const safeBody = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        safeBody[key] = req.body[key];
      }
    }

    const data = normalizeProductForm(safeBody);

    await putUpdateProduct(id, data);

    res.redirect("/products");
  } catch (err) {
    next(err);
  }
}


// DELETE product item
// async function deleteProductItem(req, res, next) {
//   try {
//     await deleteProduct(req.params.id);
//     res.redirect("/products");
//   } catch (err) {
//     next(err);
//   }
// }

async function deleteProductItem(req, res, next) {
  try {
    // 1. Validate ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).send("Invalid product ID");
    }

    // 2. Ensure product exists
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // 3. Perform delete
    await deleteProduct(id);

    res.redirect("/products");
  } catch (err) {
    next(err);
  }
}


async function getUnderConstructionPage(req, res, next) {
  try {
    res.render(
      "under-construction"
      // , {filterOptions: { brands: [], price: [], rating: [] },
      // activeFilters: {},}
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductsPage,
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProductItem,
  deleteProductItem,
  getUnderConstructionPage,
};
