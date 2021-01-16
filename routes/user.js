const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utilities/catchAsync')

router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', catchAsync(async(req, res) => {
    try {
    const {email, username, password} = req.body
    const user = new User({email, username})
    const registerUser = await User.register(user, password)
    console.log(registerUser)
    req.flash('success', 'welcome to yelpcamp new user')
    res.redirect('/campgrounds')
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
    
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back')
    res.redirect('/campgrounds')
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success', 'logged you out')
    res.redirect('/campgrounds')
})

module.exports = router