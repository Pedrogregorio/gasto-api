const express = require('express')
const router = express.Router()
const Conta = require('../models/conta')
const Saldo = require('../models/saldo')
const Ajuda = require('../models/ajuda')

function SomarAjudas(ajuda) {
    i = 0
    let resposta
    while(i < ajuda.length) {
        if(i == 0){
            resposta = Number(ajuda[i].valor) + Number(ajuda[i+1].valor)
            i++
        }else{
            resposta += Number(ajuda[i].valor)
        }
        i++
    }
    return resposta
}

function SomarContas(db_conta) {
    i = 0
    let resposta = 0
    while(i < db_conta.length) {
        if(i == 0){
            if(db_conta.length == 1){
                resposta += Number(db_conta[i].valor)  
                i++
            } else {
                resposta = Number(db_conta[i].valor) + Number(db_conta[i+1].valor)
                i++
            }
        }else{
            resposta += Number(db_conta[i].valor)
        }
        i++
    }
    return resposta
}

router.get('/inicio', async (req, res)=>{
    const db_conta = await Conta.find({ativa:true})
    const conta = SomarContas(db_conta)
    const db_saldo = await Saldo.find({id_saldo: '1'})
    return res.json({conta: conta, saldo: db_saldo[0].valor})
})

router.get('/historico', async (req, res)=>{
    const c = await Conta.find({})
    const a = await Ajuda.find({})
    const db_ajuda = a.reverse()
    const db_conta = c.reverse()
    return res.json({ajuda: db_ajuda, conta:db_conta})
})

router.post('/historico/ajuda/detalhamento', async (req, res)=>{
    try {
        const data = req.body
        let detalhamento = await Ajuda.findById(data.id).exec()
        return res.json(detalhamento)
    } catch (error) {
        return res.json(error)
    }
})

router.get('/contas', async (req, res)=>{
    try {
        const db_conta = await Conta.find({})
        return res.json(db_conta)
    } catch (error) {
        return res.json({message: error.message, status: 400})   
    }
})

router.post('/historico/conta/detalhamento', async (req, res)=>{
    try {
        const data = req.body
        let detalhamento = await Conta.findById(data.id).exec()
        return res.json(detalhamento)
    } catch (error) {
        return res.json(error)
    }
})

router.post('/add_ajuda', async (req, res)=>{
    try {
        const data = req.body
        if(!data){
            return {message: "Preencha os campos"}
        }
        await Ajuda.create(data)
        const db_saldo = await Saldo.find({})
        let saldo = Number(db_saldo[0].valor) + Number(data.valor)
        await Saldo.updateOne({id_saldo: "1"},{valor: saldo})
        return res.json({status: 200})
    } catch (error){
        return res.json({erro: error.message, status: 400})
    }
})

router.post('/add_conta', async (req, res)=>{
    try {
        const data = req.body
        await Conta.create(data)
        return res.json({status: 200})
    } catch (error){
        return res.json({erro: error.message, status: 400})
    }
})

router.post('/desativar_conta', async (req, res)=>{
    try {
        const db_conta = req.body
        const db_saldo = await Saldo.find({})
        let current_conta = await Conta.findById(db_conta.conta._id).exec()
        const valor_com_parcela = (Number(current_conta.valor) * Number(current_conta.parcela))
        if(current_conta.ativa == false){
            return res.json({status: 301, message: `Essa conta ja foi paga`})
        }
        if(Number(db_conta.conta.valor) > Number(db_saldo[0].valor)){
            let saldo = Number(db_saldo[0].valor) - Number(db_conta.conta.valor)
            return res.json({status: 301, message: `Seu saldo é insuficiente (${saldo})`})
        }
        if ((Number(db_conta.conta.valor) > valor_com_parcela)) {
            let saldo = Number(db_saldo[0].valor) - Number(db_conta.conta.valor)
            return res.json({status: 301, message: `Seu saldo é insuficiente (${saldo})`})
        }
        if (db_conta.all_parcelas == true) {
            let saldo_novo = Number(db_saldo[0].valor) - Number(valor_com_parcela)
            await Saldo.updateOne({id_saldo:'1'}, {valor: String(saldo_novo)})
            await Conta.updateOne({_id: db_conta.conta._id}, {ativa: false})    
        }
        else if(db_conta.all_parcelas == false){
            let saldo_novo = Number(db_saldo[0].valor) - Number(current_conta.valor)

            await Saldo.updateOne({id_saldo:'1'}, {valor: saldo_novo})

            if(current_conta.parcela !== 1){
                current_conta.parcela = Number(current_conta.parcela) - 1
                await Conta.updateOne({_id: db_conta.conta._id}, {ativa: false, parcela: current_conta.parcela})        
            } else {
                await Conta.updateOne({_id: db_conta.conta._id}, {ativa: false, parcela: current_conta.parcela})    
            }
        }

        return res.json({status: 200, message:'Conta paga com sucesso'})
    } catch(error) {
        return res.json({status: 400, message: error.message})
    }
})

module.exports = app => app.use('/api/v1', router)