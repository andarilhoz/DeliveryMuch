const express = require('express');
const app = express();

app.use('/', (req,res) => {
    const { sayHello} = require('./services/helloWorld')

    res.send(sayHello());
})


module.exports = {
    app
}