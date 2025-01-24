const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const ExpressError = require("../utilities/ExpressError");
const {listingSchema } = require("../schema.js");
const passport = require("passport");
const {isLoggedIn, isOwner }= require("../middleware.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// controllers
const listingController = require("../controllers/listings.js");



const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// index route
router.get("/", wrapAsync (listingController.index));

// new route
router.get("/new", isLoggedIn, wrapAsync (listingController.renderNewForm));

// show route
router.get("/:id", 
    wrapAsync (listingController.showListing));


// create route
router.post("/", 
    isLoggedIn,
    upload.single("listing[image]"),
    // (req, res, next) => {
    //     if (req.body.listings) {
    //         req.body.listing = req.body.listings;
    //         delete req.body.listings;
    //     }
    //     next();
    // },

    (req, res, next) => {
        if (req.file) {
            req.body.listing.image = req.file.path; // Include uploaded image in req.body.listing
        }
        next();
    },
    
    validateListing,
    wrapAsync (listingController.createListing)

    // (req, res) => {
    //     console.log("new");
    //     res.send(req.file);
    // }
);

// edit route
router.get("/:id/edit",
    isLoggedIn, 
    isOwner,
    wrapAsync (listingController.renderEditListing));

// update route
router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),

    
    (req, res, next) => {
        if (req.file) {
            req.body.listing.image = req.file.path; // Include uploaded image in req.body.listing
        }
        next();
    },

    validateListing,
    wrapAsync (listingController.updateListing));

// delete route
router.delete("/:id",
    isLoggedIn, 
    isOwner,
    wrapAsync (listingController.destroyListing));


module.exports = router;