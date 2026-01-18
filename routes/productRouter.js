const { Router } = require("express");
const { createProductRules } = require("../validators/productValidators");
const requireAdmin = require("../middleware/requireAdmin");

const {
  getProductsPage,
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProductItem,
  deleteProductItem,
  getUnderConstructionPage,
} = require("../controllers/productController");

const productRouter = Router();

// GET products
productRouter.get("/", getProductsPage); // no filters
productRouter.get("/list", getProductsPage); // search + filters

// GET/POST create products
productRouter.get("/create", getCreateItemPage);
// -- Only base_sku currently has validation
productRouter.post(
  "/create",
  createProductRules,
  requireAdmin,
  postNewProductItem,
);

// Static, under construction page, catch-all for anything not done or needed per this assignment
productRouter.get("/under-construction", getUnderConstructionPage);

// GET/POST(not using PUT) update products
productRouter.get("/:id/update", getUpdateForm);
// -- Using post rather than put to avoid additional modules and middleware
// productRouter.put("/:id/update", putUpdateProductItem);
// productRouter.post("/:id/update", putUpdateProductItem);
// -- Now with requireAdmin
productRouter.post("/:id/update", requireAdmin, putUpdateProductItem);

// POST (not using DELETE) delete product item
// productRouter.post("/:id/delete", deleteProductItem);
// -- Now with requireAdmin
productRouter.post("/:id/delete", requireAdmin, deleteProductItem);

module.exports = productRouter;
