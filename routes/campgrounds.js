const express = require('express')
const router =express.Router()
const Joi = require('joi')
const {campgroundSchema} = require('../schemas.js')
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/expressError')
const Campground = require('../models/campground')
const {isLoggedIn} = require('../middleware')



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

//valitoidaan kolmannen osan palvelut, kuten postman. Nää sivuthan on muuten jo validoitu
const validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.post('/',  isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
   
    // if(!req.body.campground) throw new ExpressError('invalid campground data', 400) 
    const campground = new Campground(req.body.campground)
    await campground.save()
    //flash viesti
    req.flash('success', 'Succesfully build new campground')

    res.redirect(`/campgrounds/${campground._id}`)
    
}))

router.get('/:id', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    //error handler
    if(!campground){
        req.flash('error', 'valitsemasi campground on tuhottu')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'valitsemasi campground on tuhottu')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
})) 

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground})
    req.flash('success', 'succesfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params  
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')  

}))

module.exports = router