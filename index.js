const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utilities/expressError')
const methodOverride = require('method-override')
const Joi = require('joi')

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db =mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log('database yhdistetty')
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'))


//käytetään reititintä, eli ovat erillisessä kansiossa ja niiden alkuun tulee tässä oleva alkuliite.
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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