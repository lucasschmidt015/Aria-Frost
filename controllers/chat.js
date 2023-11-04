

exports.getNewChat = (req, res, next) => {
    res.render('chat/newChat', {
        pageTitle: 'New Chat'
    })
}

exports.postNewChat = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
}