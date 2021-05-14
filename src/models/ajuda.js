const mongoose = require('../database/db')
const ajudaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    ajuda:{
        type: String,
        required: true
    },
    valor:{
        type: String,
        required: true
    }
})

const Ajuda = mongoose.model('ajudas', ajudaSchema)

module.exports = Ajuda