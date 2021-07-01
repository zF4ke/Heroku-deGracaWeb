const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    owerName: { type: String },
    ownerEmail: { type: String, required: true },
    url: { type: String, required: true },
    pricePaid: { type: Number },
})

const Advertisement = module.exports = new mongoose.model('Advertisement', AdSchema)