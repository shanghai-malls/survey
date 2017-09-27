const express = require('express');
const addRoute = require('./index');
const app = express();
addRoute(app);
app.use("/",function (req,res,next) {
    console.log(req.url);
    next();
});
app.use("/",express.static('../../build'));
const server = app.listen(3001, function() {
    console.log('Listening on port %d', server.address().port);
});
