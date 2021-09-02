const mongoose = require('../database/db')
const contaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    conta:{
        type: String,
        required: true
    },
    valor:{
        type: String,
        required: true
    },
    parcela:{
        type: Number,
        required: false
    },
    pagar_ate:{
        type: Array,
        required: false
    },
    ativa:{
        type: Boolean, 
        default: true,
        required: true,
    }
})

const Conta = mongoose.model('contas', contaSchema)

module.exports = Conta
