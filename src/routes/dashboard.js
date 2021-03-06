
const router = require('express').Router()
const axios = require('axios')
const DiscordUser = require('../database/models/DiscordUser')

async function isAuthorized(req, res, next) {
    if(req.user) {
        /* const forwarded = req.headers['x-forwarded-for']
        const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
        const user = await DiscordUser.findOne({
            discordId: req.user.discordId
        })
        const updatedUser = await DiscordUser.updateOne({
            discordId: req.user.discordId
        },
        {
            ipAddress: ip
        }) */

        res.render('dashboard', {
            username: req.user.username
        })
    } else {
        res.redirect('/auth')
    }
}

router.get('/', isAuthorized)

module.exports = router