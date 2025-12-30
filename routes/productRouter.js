// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
const {
  getProductCardPage,
  getCreateItemPage,
  getProductsWithProfit,
//   getProductUniquePage,
} = require("../controllers/productController");

const productRouter = Router();

productRouter.get("/", getProductCardPage);
// productRouter.get("/", getProductsWithProfit); // rookie mistake: Only the second one will ever run. Express matches routes top-down, and the second / overwrites the first.
// productRouter.get("/product:id", getProductUniquePage);
productRouter.get("/create", getCreateItemPage);

module.exports = productRouter;
