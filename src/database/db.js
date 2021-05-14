const mongoose = require('mongoose')

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true)

mongoose.connect('mongodb+srv://jera:desafiojera@cluster0.uixui.mongodb.net/db_gasto_familia?retryWrites=true&w=majority')

mongoose.Promise = global.Promise

module.exports = mongoose