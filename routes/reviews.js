const express = require ("express");
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewOwner} = require ("../middleware");
const Campground = require ("../models/campground");
const Review = require ("../models/review");
const reviews = require ("../controllers/reviews");

const ExpressError = require ("../utils/ExpressError");
const catchAsync = require ("../utils/catchAsync");

//Creating a review***************************************
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

//Deleting a review****************************************
router.delete("/:reviewId", isLoggedIn, isReviewOwner, catchAsync(reviews.deleteReview))

module.exports = router;