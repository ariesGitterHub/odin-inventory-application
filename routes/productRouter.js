// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
const {
  getProductsPage,
  // getCreateItemPage,
  // postCreateItemPage,
  // getProductsWithProfit,
  postNewProductItem,
  deleteProductItem,
  //   getProductUniquePage,
} = require("../controllers/productController");

const productRouter = Router();

productRouter.get("/", getProductsPage);
// productRouter.get("/", getProductsWithProfit); // rookie mistake: Only the second one will ever run. Express matches routes top-down, and the second / overwrites the first.
// productRouter.get("/product:id", getProductUniquePage);
// productRouter.get("/create", getCreateItemPage);
productRouter.post("/create", postNewProductItem);
// usersRouter.post("/create", usersController.usersCreatePost);

// Delete product item
productRouter.post("/:id/delete", deleteProductItem);

module.exports = productRouter;
