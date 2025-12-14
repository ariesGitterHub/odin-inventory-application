// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
const { getProductPage } = require("../controllers/productController");

const productRouter = Router();

// List users
// productRouter.get("/", productController.productListGet);
productRouter.get("/products/:id", getProductPage);


// // Search users
// productRouter.get("/search", productController.productSearchGet);

// // Create user
// productRouter.get("/create", productController.productCreateGet);
// productRouter.post("/create", productController.productCreatePost);

// // Update user
// productRouter.get("/:id/update", productController.productUpdateGet);
// productRouter.post("/:id/update", productController.productUpdatePost);

// // Delete user
// productRouter.post("/:id/delete", productController.productDeletePost);

module.exports = productRouter;
