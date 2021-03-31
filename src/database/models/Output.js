const mongoose = require('mongoose');

const OutputSchema = new mongoose.Schema({
    outputLog:  { type: String, required: true }
})

const Output = module.exports = new mongoose.model('Output', OutputSchema)