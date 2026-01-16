// REMINDER - ORDER MATTER!
 
// 0. FIRST!
require('dotenv').config(); // Load environment variables

// 1. Imports at the top
const express = require("express");
const session = require("express-session");
const path = require("node:path");
const productRouter = require("./routes/productRouter");

// 2. Create the app
const app = express();

// 3. App.config - boilerplate app configurations
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 4. Global middleware
app.use(express.urlencoded({ extended: true }))
// ???
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only if HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// 4.1 Locals middleware - current route middleware
// app.use((req, res, next) => {
//   res.locals.currentPath = req.path;
//   next();
// });
// Below Fixes undefined 500 errors for filterOptions and activeFilters and takes over from above commented out code
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.adminLoginError = null; // Just default to null at start

  if (!("filterOptions" in res.locals)) {
    res.locals.filterOptions = { brands: [], price: [], rating: [] };
  }

  if (!("activeFilters" in res.locals)) {
    res.locals.activeFilters = {};
  }

  next();
});

app.post("/auth/admin", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.sendStatus(200);
  }
  res.sendStatus(401);
})

// 5 Admin login routes, NOTE - once my/your admin routes grow, move to their own route, e.g., routes/adminRouter.js with this code: const adminRouter = require("./routes/adminRouter"); app.use("/admin", adminRouter);
// app.get("/admin", (req, res) => {
//   res.render("admin-login");
// });

// app.post("/admin", (req, res) => {
//   const { password } = req.body;

//   if (password === process.env.ADMIN_PASSWORD) {
//     req.session.isAdmin = true;
//     return res.redirect("/products");
//   }

//   res.status(401).render("admin-login", {
//     error: "Incorrect password",
//   });
// });

// app.post("/admin", (req, res) => {
//   const { password } = req.body;

//   if (password === process.env.ADMIN_PASSWORD) {
//     req.session.isAdmin = true;
//     return res.redirect("/products");
//   }

//   // If using modal, render current page with error message
//   res.status(401).render("index", {
//     adminLoginError: "Incorrect password",
//     // Keep other locals as needed
//     products: [], // or pass products if on index
//     filterOptions: { brands: [], price: [], rating: [] },
//     activeFilters: {},
//   });
// });

// ???
// Admin auth endpoint (modal-based, no rendering)
app.post("/auth/admin", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.sendStatus(200);
  }

  res.sendStatus(401);
});


// 6. Method override (BEFORE routes) - NOT USED
// app.use(methodOverride('_method'));

// 7. Routers (mount here)
app.use("/products", productRouter);

// 8. 404 handler (always goes last-ish!)
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

// 9. 500 handler (goes after 404 handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { error: err });
});


// 10. Startup the server (FINAL!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Express app listening on port ${PORT}...`);    
})





