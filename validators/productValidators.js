const { body } = require("express-validator");

// NOTE - I'm only doing one validator for now, and it's on create-item with the base-sku

const createProductRules = [
  body("base_sku")
    .exists({ checkFalsy: true })
    .withMessage("Base SKU is required")
    .bail()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{3}[A-Z]{3}-$/i)
    .withMessage(
      "Base SKU must match pattern: 5 letters, 3 digits, 3 letters, and '-'",
    ),
];

module.exports = { createProductRules };
