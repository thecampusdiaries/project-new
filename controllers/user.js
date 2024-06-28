const User = require('../models/user.js')

module.exports.getSignupForm = (req, res, next) => {
    res.render('user/signup.ejs')
}
module.exports.getLoginForm = (req, res) => {
    res.render('user/login.ejs')
}

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body
        pw = password
        const newUser = new User({ email, pw, username })
        const regUser = await User.register(newUser, password)
        req.login(regUser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash("success", `@${username}, Welcome to Campus Diaries, KKWIEER`)
            res.redirect('/explore')
        })
    } catch (err) {
        req.flash("error", err.message)
        res.redirect('/users/signup')
    }
}

module.exports.login = async (req, res) => {
    req.flash("success", `@${req.body.username}, Welcome back to Campus Diaries, KKWIEER!!`)
    url = res.locals.redirectUrl ? res.locals.redirectUrl : '/explore'
    res.redirect(url)
}

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
        req.flash("success", "You have been logged out successfully")
        return res.redirect('/explore')
    })
}