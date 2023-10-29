const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//routes
const authRouter = require('./routes/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter);

app.listen(3000, () => {
    console.log('Server running');
});