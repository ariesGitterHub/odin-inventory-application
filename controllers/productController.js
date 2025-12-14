

// const { body, validationResult, matchedData } = require("express-validator");

// controllers/productController.js
const { getProductById } = require("../db/queries");

async function getProductPage(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("index", {
      product, // 👈 this is what EJS receives
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductPage,
};

