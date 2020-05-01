
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.Promise = global.Promise;
mongoose
    .connect(process.env.DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log('Movies DB Connected!'))
    .catch(err => {
        console.log("Movies DB Connection Error" + err.message);
    });
//mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


// Todo Schema
var TodoSchema = new Schema({
    title: { type: String, required: true, index: {unique: true}},
    releaseDate: { type: String, required: true},
    genre: {type: String, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western'], required: true},
    actors: {type: [{actorName: String, characterName: String}], required: true}, 
    imageUrl: {type: String}
    
});

// return the model
module.exports = mongoose.model('Todo', TodoSchema);