

exports.getNewChat = (req, res, next) => {
    res.render('chat/newChat', {
        pageTitle: 'New Chat'
    })
}

exports.postNewChat = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    console.log(title);
    console.log(description);
    const image = req.file;
    console.log(image);
}