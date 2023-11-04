exports.get404 = (req, res, next) => {
    res.render('404', {
        pageTitle: 'Not found'
    })
}

exports.get500 = (req, res, next) => {
    res.render('500', {
        pageTitle: 'Error'
    })
}