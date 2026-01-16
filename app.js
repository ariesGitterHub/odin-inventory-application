require('dotenv').config(); // Load environment variables

// 1. Imports at the top
const express = require("express");
// const methodOverride = require("method-override");
const path = require("node:path");
const productRouter = require("./routes/productRouter");

// 2. Create the app
const app = express();

// 3. Boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 4. Middleware
app.use(express.urlencoded({ extended: true }));

// 4.25 Current route middleware (ADD HERE)
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// 4.5 Method override (BEFORE routes)
// app.use(methodOverride('_method'));

// 4.75 Fixes undefined 500 errors for filterOptions and activeFilters
app.use((req, res, next) => {
  if (!("filterOptions" in res.locals)) {
    res.locals.filterOptions = { brands: [], price: [], rating: [] };
  }

  if (!("activeFilters" in res.locals)) {
    res.locals.activeFilters = {};
  }

  next();
});


// 5. Routers (mount here)
app.use("/products", productRouter);

// 404 handler (always last!)
// app.use((req, res, next) => {
//   res.status(404).render("404", { url: req.originalUrl });
// });
app.use((req, res, next) => {
  res.status(404).render("404", {
    url: req.originalUrl,
    filterOptions: { brands: [], price: [], rating: [] },
    activeFilters: {},
  });
});


// Optional general error handler (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: err });
});


// 6. Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Express app listening on port ${PORT}...`);    
})