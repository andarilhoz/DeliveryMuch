const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({

    products: {
        type: [{
            _id: false,
            name: String,
            price: Number,
            quantity: Number
        }],
        required: true
    },

    total: {
        type: Number,
        required: true
    }
})

module.exports = Order = mongoose.model("Order", orderSchema);