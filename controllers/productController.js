
const { getAllProducts, postNewProduct, deleteProduct } = require("../db/queries");

const { computeProfit } = require("../helpers/profitHelper");

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

async function postNewProductItem(req, res, next) {
  try {
    await postNewProduct(req.body);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

async function deleteProductItem(req, res, next) {
  try {
    await deleteProduct(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductsPage,
  // getCreateItemPage,
  // postCreateItemPage,
  postNewProductItem,
  deleteProductItem,
};
