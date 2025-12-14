require('dotenv').config(); // Load environment variables

// 1. Imports at the top
const express = require("express");
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

// 5. Routers (mount here)
app.use("/", productRouter);


// 6. Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Express app listening on port ${PORT}...`);    
})