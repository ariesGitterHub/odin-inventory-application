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
  putUpdateProductItem,
  deleteProductItem,
  getUnderConstructionPage,
  //   getProductUniquePage,
} = require("../controllers/productController");

const productRouter = Router();

// GET all product items
productRouter.get("/", getProductsPage);

// GET create form and POST new product item
productRouter.get("/create", getCreateItemPage);
productRouter.post("/create", postNewProductItem);

// GET update form and PUT update of product item
productRouter.get("/:id/update", getUpdateForm);
// Using post rather than put to avoid additional modules and middleware
// productRouter.put("/:id/update", putUpdateProductItem);
productRouter.post("/:id/update", putUpdateProductItem);

// Delete product item
productRouter.post("/:id/delete", deleteProductItem);

// Under construction page, catch-all for anything not done or needed per this assignment
productRouter.get("/under-construction", getUnderConstructionPage);

module.exports = productRouter;
