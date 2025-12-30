// const { body, validationResult, matchedData } = require("express-validator");

// const { getProducts } = require("../db/queries");
const { getAllProducts } = require("../db/queries");
const { computeProfit } = require("../helpers/profitHelper");

// async function getProductCardPage(req, res, next) {
//   try {
//     const products = await getProducts();

//     res.render("index", {
//       products,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getProductCardPage(req, res, next) {
//   try {
//     const products = await getProducts();
//     const productsWithProfit = computeProfit(products);
//     res.render("index", { products: productsWithProfit });
//   } catch (err) {
//     next(err);
//   }
// }

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

module.exports = { getProductCardPage };

// THIS WORKS, BUT USING ABOVE WITH A HELPER INSTEAD
// async function getProductCardPage(req, res, next) {
//   try {
//     const products = await getProducts();

//     const productsWithProfit = products.map((p) => ({
//       ...p,
//       profit_per_unit: Number(p.price_unit) - Number(p.cost_unit),
//     }));

//     res.render("index", {
//       products: productsWithProfit,
//     });
//   } catch (err) {
//     next(err);
//   }
// }


// async function getProductUniquePage(req, res, next) {
//   try {
//     const { id } = req.params;
//     const product = await getProductById(id);

//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     res.render("product", {
//       product, // 👈 this is what EJS receives
//     });
//   } catch (err) {
//     next(err);
//   }
// }

module.exports = {
  getProductCardPage,
  getCreateItemPage,
  // getProductsWithProfit,
  // getProductUniquePage,
};
