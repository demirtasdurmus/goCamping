const {campgroundSchema, reviewSchema} = require ("./schemas.js");
const ExpressError = require ("./utils/ExpressError");
const Campground = require ("./models/campground");
const Review = require ("./models/review")

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in!!!")
        return res.redirect("/login")
    }
    next();
}


//JOI Validation**********************************************
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    console.log(req.body);
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400)
    } else {
        next();
    }

}

//isOwner Middleware***************************************
module.exports.isOwner = async (req,res,next) => {
    const updatedCamp = await Campground.findById(req.params.id);
    if (!updatedCamp.owner.equals(req.user.id)) {
        req.flash("error", "You are unauthorized to do this!!!")
        return res.redirect(`/campgrounds/${req.params.id}`)
    } 
    next();
}

//isReviewOwner Middleware***************************************
module.exports.isReviewOwner = async (req,res,next) => {
    const newReview = await Review.findById(req.params.reviewId);
    if (!newReview.owner.equals(req.user.id)) {
        req.flash("error", "You are unauthorized to do this!!!")
        return res.redirect(`/campgrounds/${req.params.id}`)
    } 
    next();
}