const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utilities/wrapAsync.js");
const ExpressError = require("../utilities/ExpressError");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewOwner } = require("../middleware.js");


// review controller
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// reviews
// post route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync (reviewController.createReview)
);

// delete review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewOwner,
    wrapAsync (reviewController.destroyReview)
);

module.exports = router;