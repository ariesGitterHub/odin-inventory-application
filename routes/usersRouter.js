// THIS CODE SHOULD ONLY BE USED TO MAP URLS TO CONTROLLER METHODS

const { Router } = require("express");
// const usersController = require("../controllers/usersController");

const usersRouter = Router();

// List users
// usersRouter.get("/", usersController.usersListGet);
// Main board page
usersRouter.get("/", (req, res) => {
  //   res.render("index", { title: "Main Board", messages: messages });
  // Reminder that I only need messages once if it is the same term...
  res.render("index", {
    title: "Main Board",
  });
});

// // Search users
// usersRouter.get("/search", usersController.usersSearchGet);

// // Create user
// usersRouter.get("/create", usersController.usersCreateGet);
// usersRouter.post("/create", usersController.usersCreatePost);

// // Update user
// usersRouter.get("/:id/update", usersController.usersUpdateGet);
// usersRouter.post("/:id/update", usersController.usersUpdatePost);

// // Delete user
// usersRouter.post("/:id/delete", usersController.usersDeletePost);

module.exports = usersRouter;
