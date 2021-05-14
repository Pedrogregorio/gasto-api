const mongoose = require('../database/db')
const saldoSchema = new mongoose.Schema({
    valor:{
        type: String,
        required: true
    }
})

const Saldo = mongoose.model('saldos', saldoSchema)

module.exports = Saldo