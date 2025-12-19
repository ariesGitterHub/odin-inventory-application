// decimals = number of decimal places you want (default 2 for currency)

// Multiply → round → divide avoids floating-point artifacts

// function roundToDecimals(number, decimals = 2) {
//   const factor = 10 ** decimals;
//   return Math.round(number * factor) / factor;
// }

function computeProfit(products) {
  return products.map((p) => ({
    ...p,
    // profit_per_unit: roundToDecimals(
    //   Number(p.price_unit) - Number(p.cost_unit),
    //   2
    // ),

    // profit_per_unit: Number(
    //   (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
    // ),

    // profit_per_unit:
    //   Math.round((Number(p.price_unit) - Number(p.cost_unit)) * 100) / 100,

    // profit_per_unit: Number(
    //   (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2)
    // ),

    // THERE IS A PROBLEM WITH JS DROPPING ZEROS ON NUMBERS, TRY:
    profit_per_unit: (Number(p.price_unit) - Number(p.cost_unit)).toFixed(2),
  }));
}

module.exports = { computeProfit };
