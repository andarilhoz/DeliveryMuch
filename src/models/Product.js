const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
    name: {
        type: String,
        required: true,
        unique : true
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

module.exports = Product = mongoose.model("Product", productSchema);