const express = require ("express");
const router = express.Router();
const campgrounds = require ("../controllers/campgrounds");
const catchAsync = require ("../utils/catchAsync");
const {isLoggedIn, isOwner, validateCampground} = require ("../middleware");
const multer  = require('multer');
const {storage} = require("../cloudinary");
const upload = multer({ storage });

const Campground = require ("../models/campground");

//Displaying All of the campgrounds*********************
router.get("/", catchAsync(campgrounds.index))

//Creating a new campground****************************
router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.post("/", isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))
// router.post("/",  (req,res) => {
//     console.log(req.body, req.files);
//     res.send("okkkk");
// })

//Displaying a single campground by its id************
router.get("/:id", catchAsync(campgrounds.renderDetails))

//Editing a campground by its id**********************
router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(campgrounds.renderEditForm))

router.put("/:id", isLoggedIn, isOwner, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))

//Deleting a campground************************************
router.delete("/:id", isLoggedIn, isOwner, catchAsync(campgrounds.deleteCampground))

module.exports = router;