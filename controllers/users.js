const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if (err) {
                return next(err);
            } else {
                req.flash("succes", "Welcome to the Fun Camp")
                res.redirect("/campgrounds")
            }
        })
        
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register")
    }
}

module.exports.renderLogin = (req,res) => {
    res.render("users/login");
}

module.exports.authenticateUser = (req, res) => {
    req.flash("success", "Welcome back!!!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash("success", "Goodbye!!!")
    res.redirect("/campgrounds");
}