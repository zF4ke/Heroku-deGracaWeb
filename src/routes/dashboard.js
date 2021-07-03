
const router = require('express').Router()
const DiscordUser = require('../database/models/DiscordUser')

const firebase = require('firebase')

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firestoreDb = firebase.firestore()

async function isAuthorized(req, res, next) {
    if (req.user) {
        const forwarded = req.headers['x-forwarded-for']
        const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;


        const usersRef = firestoreDb.collection('users')
        const snapshot = await usersRef.where('id', '==', req.user.discordId).get();

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