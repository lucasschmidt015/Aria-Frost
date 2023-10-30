const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { parsed: { MONGODB_URI } } = require('dotenv').config();

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

app.use(authRouter);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000, () => {
        console.log('Server running');
    });
})
.catch(err => console.log(err));
