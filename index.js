const express = require('express')
// defaulp path asetetaan tällä
const path = require('path')
//mongoDB apuri
const mongoose = require('mongoose')
//partials ja boilerplate---layout
const ejsMate = require('ejs-mate')
//sessions
const session = require('express-session')
const cookieParser = require('cookie-parser')
//flash
const flash = require('connect-flash')
//oma express errori
const ExpressError = require('./utilities/expressError')
//tarvitaan että voidaan käyttää httpn kanssa PUT, DELETE ja muita ei supportoituja
const methodOverride = require('method-override')
//käytetään mongopohjapiirustusten validointiin
const Joi = require('joi')
//passport
const passport = require('passport')
const LocalStradegy = require('passport-local')
const User = require('./models/user')




// router muuttujat, jotka exportataan toisesta kansiosta
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user')

//yhdistetään tietokantaan
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
const db =mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log('database yhdistetty')
})

const app = express()
//embedded javascript 'ejs'
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
//asetetaan views poluksi
app.set('views', path.join(__dirname, 'views'))
//bodyparser
app.use(express.urlencoded({ extended: true}))
//method overdriveä käytetään '_method' lisäyksellä
app.use(methodOverride('_method'))
//käytetään public kansiota, missä on static tiedostot
app.use(express.static(path.join(__dirname, 'public')))

//session
app.use(cookieParser())
const sessionConfig = {
    secret: 'huonosalaisuus',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //date on millisekuntteina ja tossa on viikon millisekunnit
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:   1000 * 60 * 60 * 24 * 7

    }
}
app.use(session(sessionConfig))
//use flash
app.use(flash())

//pitää sijoittaa sessionin alle
//kerrotaan passportille että halutaan käyttää localstrategyä joka löytyy userin takaa
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStradegy(User.authenticate()))
//sessiossa oleminen ja olemattomuus
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//flash middleware flash success laukasee
app.use((req, res, next) => {
    /* console.log(req.session) */
    //The res.locals property is an object that contains response local variables scoped to the request and because of this, it is only available to the view(s) rendered during that request/response cycle (if any).
    res.locals.success = req.flash('success')
    //middleware, muista next kaikissa sellasissa.
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})



//käytetään reititintä, eli ovat erillisessä kansiossa ja niiden alkuun tulee tässä oleva alkuliite.
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', userRoutes)

//turha etusivu
app.get('/', (req, res) => {
    
    res.render('home')
})

//Jos kirjoitit väärän sivu osoitteen tulee errori
app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})

//kirjoittaa errorin
app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })

})


//kuunnellaan local serveriä
app.listen(3000, () => {
    console.log('server online')
})