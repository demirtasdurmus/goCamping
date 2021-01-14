if (process.env.NODE_ENV !== "production") {
    // require("dotenv").config();
}
require("dotenv").config();

//Requiring modules*************************************
const express = require ("express");
const path = require ("path");
const mongoose = require ("mongoose");
const engine = require ("ejs-mate");
const session = require ("express-session");
const flash = require ("connect-flash");
const ExpressError = require ("./utils/ExpressError");
const methodOverride = require ("method-override");
const passport = require ("passport");
const localStrategy = require ("passport-local");
const User = require ("./models/user");
const helmet = require("helmet");

const mongoSanitize = require('express-mongo-sanitize');

//requiring routes********************************************
const userRoutes = require ("./routes/users");
const campgroundRoutes = require ("./routes/campgrounds");
const reviewRoutes = require ("./routes/reviews");
const MongoDBStore = require ("connect-mongo")(session);
const dbUrl = process.env.DB_URL;


//connecting mongoose**********************************
  
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Mongoose connection error handling********************
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected to DB");
});

//Using and Setting modules*******************************
const app = express();

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: "_"
}));

const secret = process.env.SECRET || "thisismyspecialsecret";

const store = new MongoDBStore ({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store: store,
    name: "session",
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() +1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

//USing passport&passport local**********************************
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//creating a middleware for flashes*******************************
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//Using the routes***************************************
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//Home page***************************************************
app.get("/", (req,res) => {
    res.render('home');
})

//Setting up a 404 error page**************************************
app.all("*", (req, res, next) => {
    next (new ExpressError("Page not found", 404));
})

//basic error handler******************************************
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Oh no sth went wrong";
    res.status(statusCode).render("error", {err});
})

//Setting up the Server********************************************
app.listen(3000, () => {
    console.log("Server is awake on port 3000");
})