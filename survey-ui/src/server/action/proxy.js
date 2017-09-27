const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const {baseURI} = require("../common");

const router = express.Router();
router.get('/',(req,res)=>{
    req.pipe(request.get(baseURI + req.originalUrl)).pipe(res);
});

router.get('/:id',(req,res)=>{
    req.pipe(request.get(baseURI + req.originalUrl)).pipe(res);
});

router.post('/:id/responses',function(req, res) {
    req.pipe(request.post(baseURI + req.originalUrl)).pipe(res);
});

router.get('/:id/responses/:responseId',function(req, res) {
    req.pipe(request.get(baseURI + req.originalUrl)).pipe(res);
});


router.get('/:id/responses/:responseId/questions',function(req, res) {
    req.pipe(request.get(baseURI + req.originalUrl)).pipe(res);
});

router.put('/:id/responses/:responseId',function(req, res) {
    req.pipe(request.put(baseURI + req.originalUrl)).pipe(res);
});

router.post('/:id/responses/:responseId/items',function(req, res) {
    req.pipe(request.post(baseURI + req.originalUrl)).pipe(res);
});

module.exports = router;