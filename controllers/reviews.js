const Campground = require ("../models/campground");
const Review = require ("../models/review");


module.exports.createReview = async (req, res) => {
    const foundCamp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.owner = req.user.id;
    foundCamp.reviews.push(newReview);
    await newReview.save();
    await foundCamp.save();
    req.flash("success", "Your review has been successfuly added!")
    res.redirect(`/campgrounds/${foundCamp.id}`);
}

module.exports.deleteReview = async (req, res) => {
    const campId = req.params.id;
    const reviewId = req.params.reviewId;
    await Campground.findByIdAndUpdate(campId, {$pull: {reviews: reviewId}}, {useFindAndModify: false});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Your review has been successfuly deleted!")
    res.redirect(`/campgrounds/${campId}`)
}