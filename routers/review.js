const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");



//   review :-
// post route :-

router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.newReview)
);

// delete review ;-

router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deletereview)
);

module.exports = router;