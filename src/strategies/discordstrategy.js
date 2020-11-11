const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport')
const DiscordUser = require('../database/models/DiscordUser')
const config = require('../config/client.json')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await DiscordUser.findById(id)
    if(user) done(null, user )
})

passport.use(new DiscordStrategy({
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    callbackURL: config.CLIENT_REDIRECT,
    scope: ['identify','email','guilds','guilds.join']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await DiscordUser.findOne({
            discordId: profile.id
        })
        if(user) {
            done(null, user)
        } else {
            const newUser = await DiscordUser.create({
                discordId: profile.id,
                username: `${profile.username}#${profile.discriminator}`,
                email: profile.email,
                mfa_enabled: profile.mfa_enabled,
                premium_type: profile.premium_type,
                guilds: profile.guilds
            })
            const savedUser = await newUser.save()
            done(null, savedUser)
        }
    } catch (err) {
        console.log(err)
        done(err, null)
    }
}))