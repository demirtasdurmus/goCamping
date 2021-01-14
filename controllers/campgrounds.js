const Campground = require ("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const MapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: MapBoxToken});
const {cloudinary} = require ("../cloudinary");


module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
}

module.exports.renderNewForm = (req,res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({url:f.path, filename: f.filename}));
    newCamp.owner = req.user.id;
    await newCamp.save();
    req.flash("success", "Successfully added the new campground");
    res.redirect(`/campgrounds/${newCamp.id}`)
}

module.exports.renderDetails = async (req,res) => {
    const foundCamp = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "owner"
        }
    }).populate("owner");
    if (!foundCamp) {
        req.flash("error", "Couldn't find the campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/details", {foundCamp});
}

module.exports.renderEditForm= async (req,res) => {
    const campSelect = await Campground.findById(req.params.id);
    if (!campSelect) {
        req.flash("error", "Couldn't find the campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", {campSelect});
}

module.exports.updateCampground = async (req, res) => {
    const updatedCamp = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground}, {useFindAndModify: false});
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}));
    updatedCamp.images.push(...imgs);
    await updatedCamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("success", "The campground has been successfully updated!")
    res.redirect(`/campgrounds/${updatedCamp.id}`);
}

module.exports.deleteCampground = async (req,res) => {
    await Campground.findByIdAndDelete(req.params.id, {useFindAndModify: false});
    req.flash("success", "The campground has been successfuly deleted!")
    res.redirect("/campgrounds");
}