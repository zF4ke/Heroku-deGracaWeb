const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport')
const DiscordUser = require('../database/models/DiscordUser')
const { firestoreDb } = require('../services/firebase')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await DiscordUser.findById(id)
    if (user) done(null, user)
})

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CLIENT_REDIRECT,
    scope: ['identify', 'email', 'guilds', 'guilds.join', 'connections']
}, async (accessToken, refreshToken, profile, done) => {
    try {

        //MongoDB
        const user = await DiscordUser.findOne({
            discordId: profile.id
        })

        //Firestore
        const usersRef = firestoreDb.collection('users')
        const snapshot = await usersRef.where('id', '==', profile.id).get();

        const ipAddress = "naoprocessado"

        if (snapshot.docs.length > 0) {
            snapshot.forEach(async doc => {
                const user = await doc.data()
                user.key = doc.id

                var userPrototype = {}

                userPrototype.id = profile.id
                userPrototype.name = `${profile.username}#${profile.discriminator}`
                if (user.email) {
                    var tempArr = user.email
                    if (tempArr.indexOf(profile.email) === -1) {
                        tempArr.push(profile.email)

                        userPrototype.emails = tempArr
                    } else {
                        userPrototype.emails = tempArr
                    }
                } else {
                    userPrototype.emails = [profile.email]
                }

                userPrototype.guilds = profile.guilds
                if (profile.premium_type) {
                    userPrototype.premiumType = profile.premium_type
                } else {
                    userPrototype.premiumType = "0"
                }
                userPrototype.mfaEnabled = profile.mfa_enabled

                if (user.connections) {
                    userPrototype.connections = user.connections.concat(profile.connections).unique();
                } else {
                    userPrototype.connections = profile.connections
                }

                userPrototype.flags = user.flags
                userPrototype.locale = user.locale
                userPrototype.verified = user.verified
                if (user.ipAddresses) userPrototype.ipAddresses = user.ipAddresses
                userPrototype.refreshToken = refreshToken

                await usersRef.doc(doc.id).update({
                    connections: userPrototype.connections,
                    emails: userPrototype.emails,
                    flags: userPrototype.flags,
                    guilds: userPrototype.guilds,
                    id: userPrototype.id,
                    ipAddresses: userPrototype.ipAddresses,
                    locale: userPrototype.locale,
                    mfaEnabled: userPrototype.mfaEnabled,
                    name: userPrototype.name,
                    premiumType: userPrototype.premiumType,
                    refreshToken: userPrototype.refreshToken,
                    verified: userPrototype.verified,
                    isTrusted: true
                })
            })
        } else {
            await firestoreDb.collection('users').add({
                id: profile.id,
                name: `${profile.username}#${profile.discriminator}`,
                emails: [profile.email],
                mfaEnabled: profile.mfa_enabled,
                premiumType: profile.premium_type || "0",
                guilds: profile.guilds,
                connections: profile.connections,
                flags: profile.flags,
                locale: profile.locale,
                verified: profile.verified,
                refreshToken: refreshToken,
                ipAddresses: [],
                isTrusted: true
            });
        }

        if (user) {
            await DiscordUser.updateOne({
                discordId: profile.id
            },
                {
                    username: `${profile.username}#${profile.discriminator}`,
                    email: profile.email,
                    mfa_enabled: profile.mfa_enabled,
                    premium_type: profile.premium_type,
                    guilds: profile.guilds,
                    ipAddress: ipAddress,
                    connections: profile.connections,
                    flags: profile.flags,
                    locale: profile.locale,
                    verified: profile.verified,
                    refreshToken: refreshToken,
                    isTrusted: true
                })
            done(null, user)
        } else {
            const newUser = await DiscordUser.create({
                discordId: profile.id,
                username: `${profile.username}#${profile.discriminator}`,
                email: profile.email,
                mfa_enabled: profile.mfa_enabled,
                premium_type: profile.premium_type,
                guilds: profile.guilds,
                ipAddress: ipAddress,
                connections: profile.connections,
                flags: profile.flags,
                locale: profile.locale,
                verified: profile.verified,
                refreshToken: refreshToken,
                isTrusted: true
            })
            const savedUser = await newUser.save()
            done(null, savedUser)
        }
    } catch (err) {
        console.log(err)
        done(err, null)
    }
}))

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};