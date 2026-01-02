// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
const {
  getProductCardPage,
  getCreateItemPage,
  // postCreateItemPage,
  getProductsWithProfit,
  deleteProductItem,
  //   getProductUniquePage,
} = require("../controllers/productController");

const productRouter = Router();

productRouter.get("/", getProductCardPage);
// productRouter.get("/", getProductsWithProfit); // rookie mistake: Only the second one will ever run. Express matches routes top-down, and the second / overwrites the first.
// productRouter.get("/product:id", getProductUniquePage);
productRouter.get("/create", getCreateItemPage);
// productRouter.post("/create", postCreateItemPage);
// usersRouter.post("/create", usersController.usersCreatePost);

// Delete product
productRouter.post("/:id/delete", deleteProductItem);

module.exports = productRouter;
