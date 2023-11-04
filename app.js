const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const { parsed: { MONGODB_URI } } = require('dotenv').config();

//Middlewares
const isAuth = require('./middlewares/isAuth');
const isAccountValid = require('./middlewares/isAccountValid');

//routes
const authRouter = require('./routes/auth');

//DB
const User = require('./models/user');

//controllers
const errorController = require('./controllers/error');

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
})

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'MySecret',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.isLoggedIn = req.session.isLoggedIn;
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        next(new Error(err))
    });
})

//Home page
app.get('/', isAuth, isAccountValid, (req, res, next) => {
    res.render('home', {
        pageTitle: 'Chat App'
    })
})

app.use(authRouter);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('500', {
        pageTitle: 'Error'
    })
})

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000, () => {
        console.log('Server running');
    });
})
.catch(err => console.log(err));
