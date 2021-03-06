const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport')
const DiscordUser = require('../database/models/DiscordUser')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await DiscordUser.findById(id)
    if(user) done(null, user)
})

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CLIENT_REDIRECT,
    scope: ['identify','email','guilds','guilds.join']
}, async (accessToken, refreshToken, profile, done) => {
    try {   
        const user = await DiscordUser.findOne({
            discordId: profile.id
        })
        const ipAddress = "naoprocessado"
        if(user) {
            const updatedUser = await DiscordUser.updateOne({
                discordId: profile.id
            },
            {
                username: `${profile.username}#${profile.discriminator}`,
                email: profile.email,
                mfa_enabled: profile.mfa_enabled,
                premium_type: profile.premium_type,
                guilds: profile.guilds,
                ipAddress: ipAddress
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
                ipAddress: ipAddress
            })
            const savedUser = await newUser.save()
            done(null, savedUser)
        }
    } catch (err) {
        console.log(err)
        done(err, null)
    }
}))