const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const {baseURI} = require("../common");

const router = express.Router();
router.get('/',bodyParser.urlencoded({extended:false}),(req,res)=>{
    let page = req.query.page || 0;
    let size = req.query.size || 20;

    let options = {
        url     :   `${baseURI}/api/surveys?page=${page}&size=${size}&projection=basic`,
        method  :   'GET',
        json    :   true,
        headers :   req.headers
    };

    function onData(data){
        let embedded = data._embedded;
        embedded.page = data.page;
        res.json(embedded);
    }

    function onError(errorResponse){
        let error = errorResponse.error;
        res.json({error})
    }

    request(options).then(onData).catch(onError);
});

router.get('/:id',bodyParser.urlencoded({extended:false}),(req,res)=>{
    let options = {
        method  :'GET',
        url     :`${baseURI}/api/surveys/${req.params.id}?projection=detail`,
        json    : true,
        headers : req.headers
    };

    return request(options).then(survey=>{
        res.json({survey})
    }).catch(errorResponse=>{
        res.json({error:errorResponse.error})
    });

});


module.exports = router;