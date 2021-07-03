
const router = require('express').Router()
const axios = require('axios')
const DiscordUser = require('../database/models/DiscordUser')
const firestoreDb = require('../services/firebase')

async function isAuthorized(req, res, next) {
    if (req.user) {
        const forwarded = req.headers['x-forwarded-for']
        const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;


        const usersRef = firestoreDb.collection('users')
        const snapshot = await usersRef.where('id', '==', profile.id).get();

        if (!snapshot.empty) {
            snapshot.forEach(async doc => {
                const user = await doc.data()
                user.key = doc.id

                await usersRef.doc(user.key).update({
                    ipAddress: ip
                })
            })
        }

        const user = await DiscordUser.findOne({
            discordId: req.user.discordId
        })

        const updatedUser = await DiscordUser.updateOne({
            discordId: req.user.discordId
        },
            {
                ipAddress: ip
            })

        res.render('dashboard', {
            username: req.user.username
        })
    } else {
        res.redirect('/auth')
    }
}

router.get('/', isAuthorized)

module.exports = router