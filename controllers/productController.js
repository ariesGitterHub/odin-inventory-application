
const { 
  getAllProducts,
  getProductById,
  // postNewProduct,
  upsertProduct,
  deleteProduct
 } = require("../db/queries");

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

async function getCreateItemPage(req, res, next) {
  try {
    res.render("create-item");
  } catch (err) {
    next(err);
  }
}

// async function postNewProductItem(req, res, next) {
//   try {
//     await postNewProduct(req.body);
//     res.redirect("/");
//   } catch (err) {
//     next(err);
//   }
// }

// postNewProduct() needs to be altered to receive structured images, clean tags[], and validated stock[]. 

async function postNewProductItem(req, res, next) {
  try {
    const {
      animal_type,
      item_type,
      brand,
      price_unit,
      cost_unit,
      base_sku,
      rating,
      review_count,
      front,
      rear,
      size,
      tags,
      sizes,
      barcodes,
      units,
      storage,
    } = req.body;

    // ✅ images object
    const images = {};
    if (front) images.front = front;
    if (rear) images.rear = rear;
    if (size) images.size = size;

    // ✅ tags array
    const tagList = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // ✅ stock (empty for now)
    const stock = [];

    if (sizes) {
      const sizeArr = [].concat(sizes);
      const barcodeArr = [].concat(barcodes);
      const unitArr = [].concat(units);
      const storageArr = [].concat(storage);

      for (let i = 0; i < sizeArr.length; i++) {
        stock.push({
          size: sizeArr[i],
          barcode: barcodeArr[i],
          units: Number(unitArr[i]) || 0,
          storage: storageArr[i],
        });
      }
    }


    await postNewProduct({
      animal_type,
      item_type,
      brand,
      price_unit,
      cost_unit,
      base_sku,
      rating,
      review_count,
      images,
      tags: tagList,
      stock,
    });

    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

async function getUpdateForm(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    res.render("update-item", { product });
  } catch (err) {
    next(err);
  }
};

async function putUpdateProduct (req, res, next) {
  try {
    // await updateProduct(req.params.id, req.body);
    await upsertProduct(req.params.id, req.body);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};


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
  getCreateItemPage,
  postNewProductItem,
  getUpdateForm,
  putUpdateProduct,
  deleteProductItem,
};
