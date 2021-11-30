const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({

    products: {
        type: [{
            name: String,
            price: Number,
            quanity: Number
        }],
        required: true
    },

    total: {
        type: Number,
        required: true
    }
})

module.exports = Order = mongoose.model("Order", orderSchema);