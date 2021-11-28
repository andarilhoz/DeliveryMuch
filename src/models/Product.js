const mongoos = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    }

})
