// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
const {
  getProductsPage,
  // getCreateItemPage,
  // postCreateItemPage,
  // getProductsWithProfit,
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProduct,
  deleteProductItem,
  //   getProductUniquePage,
} = require("../controllers/productController");

const productRouter = Router();

productRouter.get("/", getProductsPage);

productRouter.get("/create", getCreateItemPage);
productRouter.post("/create", postNewProductItem);

productRouter.get("/:id/update", getUpdateForm);
productRouter.put("/:id", putUpdateProduct);

// Delete product item
productRouter.post("/:id/delete", deleteProductItem);

module.exports = productRouter;
