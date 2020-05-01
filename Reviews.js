
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('Reviews DB Connected!'))
    .catch(err => {
        console.log("Reviews DB Connection Error" + err.message);
    });
//mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


// Todo Schema
var TodoSchema = new Schema({
    quote: { type: String, required: true},
    userName: { type: String, required: true},
    rating: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true}, 
    movieId: {type: mongoose.Schema.Types.ObjectId, required: true}
    
});

ReviewSchema.index({userId : 1, movieId : 1}, {unique: true});

// return the model
module.exports = mongoose.model('Todo', TodoSchema);