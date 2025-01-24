const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utilities/wrapAsync");
const passport = require("passport");
const { route } = require("./listing.js");
const { saveRedirectUrl } = require("../middleware.js");

// user controller
const userController = require("../controllers/users.js");

router.get("/signup", userController.renderSignUp);


// signup page
router.post("/signup", 
    wrapAsync
    (userController.signup)
);


// login page
router.get("/login", userController.renderLogin);


// login post
router.post("/login",
    saveRedirectUrl, 
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    userController.login
);


// logout page
router.get("/logout", userController.logout);

module.exports = router;