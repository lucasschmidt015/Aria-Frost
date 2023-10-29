
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login'
    })
}

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'SignUp'
    })
}