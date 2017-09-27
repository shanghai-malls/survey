const express = require('express');
const {baseURI} = require("../common");
const request = require('request');
const router = express.Router();
router.get('/:timestamp',(req,res)=>{
    req.pipe(request(`${baseURI}/captcha/${req.params.timestamp}`)).pipe(res);
});
module.exports = router;