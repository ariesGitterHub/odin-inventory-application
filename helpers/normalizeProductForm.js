// NOTE and REMINDER - Anything coming from a form should be normalized exactly once

function normalizeProductForm(body) {
  const {
    product_name,
    brand,
    item_type,
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
  } = body;

  // Images
  const images = {};
  if (front) images.front = front;
  if (rear) images.rear = rear;
  if (size) images.size = size;

  // Tags
  const tagList = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Stock
  const stock = [];

  if (sizes) {
    const sizeArr = [].concat(sizes);
    const barcodeArr = [].concat(barcodes);
    const unitArr = [].concat(units);
    const storageArr = [].concat(storage);

    for (let i = 0; i < sizeArr.length; i++) {
      stock.push({
        size: sizeArr[i]?.trim().toUpperCase(),
        barcode: barcodeArr[i] || null,
        units: Number(unitArr[i]) || 0,
        storage: storageArr[i] || null,
      });
    }
  }

  //   return {
  //     product_name,
  //     item_type,
  //     brand,
  //     price_unit,
  //     cost_unit,
  //     base_sku,
  //     rating,
  //     review_count,
  //     images,
  //     tags: tagList,
  //     stock,
  //   };

  return {
    product_name:
      typeof product_name === "string"
        ? product_name.trim().toLowerCase()
        : null,

    item_type:
      typeof item_type === "string" ? item_type.trim().toLowerCase() : null,

    brand: typeof brand === "string" ? brand.trim().toLowerCase() : null,

    price_unit,
    cost_unit,

    base_sku:
      typeof base_sku === "string" ? base_sku.trim().toUpperCase() : null,

    rating,
    review_count,
    images,

    tags: tagList
      .filter((t) => typeof t === "string")
      .map((t) => t.trim().toLowerCase()),

    stock,
  };
}

module.exports = normalizeProductForm;
