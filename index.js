const express = require('express')
// defaulp path asetetaan tällä
const path = require('path')
//mongoDB apuri
const mongoose = require('mongoose')
//partials ja boilerplate---layout
const ejsMate = require('ejs-mate')
//oma express errori
const ExpressError = require('./utilities/expressError')
//tarvitaan että voidaan käyttää httpn kanssa PUT, DELETE ja muita ei supportoituja
const methodOverride = require('method-override')
//käytetään mongopohjapiirustusten validointiin
const Joi = require('joi')

// router muuttujat, jotka exportataan toisesta kansiosta
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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