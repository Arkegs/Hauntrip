if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const { mysterySchema, evidenceSchema } = require('./validationSchemas.js');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);

const methodOverride = require('method-override');
const Mystery = require('./models/mystery');
const Evidence = require('./models/evidence')

const userRoutes = require('./routes/users');
const mysteriesRoutes = require('./routes/mysteries');
const evidencesRoutes = require('./routes/evidences');
const adminRoutes = require('./routes/admin');

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_KEY}@cluster0.i4xd8.mongodb.net/hauntrip?retryWrites=true&w=majority`, { useUnifiedTopology: true })
.then(() => {
    console.log("MONGO CONNECTION OPEN!!!")
})
.catch(err => {
    console.log("Error, MONGO CONNECTION!!!!")
    console.log(err)
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize());
app.use(require("body-parser").json());

const store = new MongoDBStore({
    url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_KEY}@cluster0.i4xd8.mongodb.net/hauntrip?retryWrites=true&w=majority`,
    secret: process.env.SESSION_SECRET,
    touchAfter: 7*24*60*60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR");
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 25 * 7,
        maxAge: 1000 * 60 * 60 * 25 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/"
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com",
    "https://fontawesome.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://cdnjs.cloudflare.com"
];
const fontSrcUrls = [
    "https://cdnjs.cloudflare.com",
    "https://fontawesome.com/"

];
const frameSrcUrls = [
    "https://www.google.com/recaptcha/",
    "https://recaptcha.google.com/recaptcha/"
]
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            frameSrc: [...frameSrcUrls],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/arkeg/", 
                "https://images.unsplash.com",
                "https://image.flaticon.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/mysteries', mysteriesRoutes);
app.use('/mysteries/:id/evidences', evidencesRoutes);
app.use('/adminpanel', adminRoutes);


app.get('/', (req, res) => {
    if(!req.user){
        res.render('home');
    }
    else{
        res.redirect('/mysteries');
    }
    
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong";
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000 motherfucker!')
});