

module.exports = (req, res, next) => {
    if (!req.user.verificated) {
        return res.redirect('/accountConfirmationScreen');
    }
    next();
}