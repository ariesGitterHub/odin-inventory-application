const { body, validationResult, matchedData } = require("express-validator");

// const { getProducts } = require("../db/queries");

// const { getAllProducts, postNewProduct } = require("../db/queries");
const { getAllProducts, deleteProduct } = require("../db/queries");

const { computeProfit } = require("../helpers/profitHelper");

// Error messages
const alphaErr = "must only contain letters.";
const baseSkuErr =
  "must be 5 uppercase letters, 3 digits, 3 uppercase letters, and end with a dash (-).";
const lengthErr = "must be between 1 and 20 characters.";
const currencyErr = "must be in currency format, e.g., 3.00 or 15.99.";

// Validation array
// const validateUser = [
//   // Animal Type
//   body("product_name")
//     .trim()
//     .matches(/^[a-z]+$/)
//     .withMessage(`Animal type ${alphaErr}`)
//     .isLength({ min: 1, max: 20 })
//     .withMessage(`Animal type ${lengthErr}`)
//     .notEmpty()
//     .withMessage("Animal type is required")
//     ,

//   // Item Type
//   body("item_type")
//     .trim()
//     .matches(/^[a-z]+$/)
//     .withMessage(`Item type ${alphaErr}`)
//     .isLength({ min: 1, max: 20 })
//     .withMessage(`Item type ${lengthErr}`)
//     .notEmpty()
//     .withMessage("Item type is required")
//     ,

//   // Brand
//   body("brand")
//     .trim()
//     .matches(/^[a-z]+$/)
//     .withMessage(`Brand ${alphaErr}`)
//     .isLength({ min: 1, max: 20 })
//     .withMessage(`Brand ${lengthErr}`)
//     .notEmpty()
//     .withMessage("Brand is required")
//     ,

//   // Base SKU
//   body("base_sku")
//     .trim()
//     .matches(/^[A-Z]{5}[0-9]{3}[A-Z]{3}-$/)
//     .withMessage(baseSkuErr)
//     .isLength({ min: 12, max: 12 })
//     .withMessage("Base SKU must be exactly 12 characters")
//     .notEmpty()
//     .withMessage("Base SKU is required")
//     ,

//   // Price per unit
//   body("price_unit")
//     .trim()
//     .isFloat({ min: 0.0, max: 199.99 })
//     .withMessage(`Price per unit ${currencyErr}`)
//     ,

//   // Cost per unit
//   body("cost_unit")
//     .trim()
//     .isFloat({ min: 0.0, max: 199.99 })
//     .withMessage(`Cost per unit ${currencyErr}`)
//     ,

//   // Filename or link
//   // body("filename_or_link").trim().isURL().withMessage("Must be a valid URL"),
//   body("filename_or_link")
//   .trim()
//   .isURL()
//   ,
// ];

async function getProductCardPage(req, res, next) {
  try {
    const products = await getAllProducts();
    // res.render("index", { products });
    const productsWithProfit = computeProfit(products);
    res.render("index", { products: productsWithProfit });
  } catch (err) {
    next(err);
  }
}

async function getCreateItemPage(req, res, next) {
  try {
    res.render("create-item");
  } catch (err) {
    next(err);
  }
}

// async function postCreateItemPage(req, res, next) {
//   try {
//     // Run validation
//     await Promise.all(validateUser.map((validator) => validator.run(req)));

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // Return errors and pre-fill form
//       return res.status(400).render("create-item", {
//         errors: errors.array(),
//         formData: req.body, // so the user doesn’t have to retype
//       });
//     }

//     // Get validated data
//     const {
//       product_name,
//       item_type,
//       brand,
//       price_unit,
//       cost_unit,
//       base_sku,
//       rating,
//       review_count,
//       images,
//     } = matchedData(req);

//     // Insert new product
//     const newProduct = await postNewProduct({
//       product_name,
//       item_type,
//       brand,
//       price_unit,
//       cost_unit,
//       base_sku,
//       rating,
//       review_count,
//       images,
//     });

//     // Redirect after success
//     res.redirect(`/products/${newProduct.id}`); // or just "/"
//   } catch (err) {
//     console.error(err);
//     next(err); // pass to Express error handler
//   }
// }

async function deleteProductItem(req, res, next) {
  try {
    await deleteProduct(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductCardPage,
  getCreateItemPage,
  // postCreateItemPage,
  deleteProductItem,
};
