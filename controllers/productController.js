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

// async function getProductsPage(req, res, next) {
//   try {
//     const products = await getAllProducts();
//     const productsWithProfit = computeProfit(products);
//     res.render("index", { products: productsWithProfit });
//     // res.render("index", { products });
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

// NOTE - use the helper normalizeProductForm that both POST and PUT controllers will use, it will make both more readable and keep me D.R.Y.

async function postNewProductItem(req, res, next) {
  try {
    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("create-item", {
        errors: errors.array(),
        oldInput: req.body,
      });
    }

    // NEW - server-side safety checks

    if (!req.body.sizes || !Array.isArray(req.body.sizes)) {
      return res.status(400).send("Sizes data missing or invalid");
    }
    if (!req.body.units || !Array.isArray(req.body.units)) {
      return res.status(400).send("Units data missing or invalid");
    }

    // Prevent null strings from breaking localeCompare or other string ops
    if (!req.body.product_name) req.body.product_name = "";
    if (!req.body.brand) req.body.brand = "";
    if (!req.body.item_type) req.body.item_type = "";

    // Now safe to normalize and post
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
    });
  } catch (err) {
    next(err);
  }
}

async function putUpdateProductItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("update-item", {
        errors: errors.array(),
        product: { id, ...req.body },
      });
    }

    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    // NEW - server-side safety checks

    if (!req.body.sizes || !Array.isArray(req.body.sizes)) {
      return res.status(400).send("Sizes data missing or invalid");
    }
    if (!req.body.units || !Array.isArray(req.body.units)) {
      return res.status(400).send("Units data missing or invalid");
    }

    if (!req.body.product_name) req.body.product_name = "";
    if (!req.body.brand) req.body.brand = "";
    if (!req.body.item_type) req.body.item_type = "";

    // Whitelist allowed fields
    const allowedFields = [
      "product_name",
      "brand",
      "item_type",
      "price_unit",
      "cost_unit",
      "tags",
      "sizes",
      "units",
      "barcodes",
      "storage",
      "front",
      "rear",
      "size",
      "rating",
      "review_count",
      "base_sku",
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

async function deleteProductItem(req, res, next) {
  try {
    // Validate ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).send("Invalid product ID");
    }

    // Ensure product exists
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Perform delete
    await deleteProduct(id);

    res.redirect("/products");
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
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProductItem,
  deleteProductItem,
  getUnderConstructionPage,
};
