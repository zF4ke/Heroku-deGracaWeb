const router = require('express').Router()
const passport = require('passport')
const DiscordUser = require('../database/models/DiscordUser')

function isAdmin(req, res, next, action) {
    let adminIDs = ["676156690395037713"]

    if(req.user) {
        console.log(action)
        if(adminIDs.indexOf(req.user.discordId) > -1) {
            if(action == 1) {
                res.render('admin')
            } else {
                next()
            }
        } else {
            res.redirect('/auth')
        }
    } else {
        res.redirect('/auth')
    }
}

router.get('/',  (req, res, next) => {
    isAdmin(req, res, next, 1)
})

router.get('/user', isAdmin, (req, res, next) => {
    try {
        DiscordUser.find({}, function (err, users) {
            if(err) {
                res.send('Something went really wrong.')
                next()
            }
            res.json(users)
        })
    } catch (err) {
        console.error(err)
    }

})

router.get('/user/:id', isAdmin, (req, res, next) => {
    try {
        DiscordUser.findOne({
            discordId: req.params.id
        }).then(userFound => {
            if(!userFound) return res.sendStatus(404).end()

            res.json(userFound)
        })
    } catch (err) {
        console.error(err)
    }
})

router.get('/user/:id/guild_id/:guild', isAdmin, (req, res, next) => {
    try {
        DiscordUser.findOne({
            discordId: req.params.id,
            "guilds.id" : req.params.guild 
        }).then(userFound => {
            if(!userFound) return res.sendStatus(404).end()

            const guild = userFound.guilds.find(guild=>guild.id == Number(req.params.guild));

            res.json(guild)
        })
    } catch (err) {
        console.error(err)
    }
})

router.get('/user/:id/guild_name/:name', isAdmin, (req, res, next) => {
    try {
        DiscordUser.findOne({
            discordId: req.params.name,
            "guilds.name" :  new RegExp(req.params.name, 'ix')
        }).then(userFound => {
            if(!userFound) return res.sendStatus(404).end()

            res.json(userFound)
        })
    } catch (err) {
        console.error(err)
    }
})

module.exports = router