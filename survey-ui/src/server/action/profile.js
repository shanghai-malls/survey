const express = require('express')
const bodyParser = require('body-parser');
const requestPromise = require('request-promise-native');
const request = require('request');
const {baseURI} = require('../common');

const router = express.Router();

router.get('/',(req,res)=>{

    let options = {
        url     : `${baseURI}/api/profile`,
        method  : 'GET',
        json    : 'true',
        headers : req.headers
    };
    function onData(profile){
        res.json(profile);
    }

    function onError(errorResponse){
        let error = errorResponse.error;
        res.json({error})
    }

    requestPromise(options).then(onData).catch(onError);

});

router.get('/responses',bodyParser.urlencoded({ extended: false }),(req,res)=>{
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let options = {
        url     : `${baseURI}/api/profile/responses?page=${page}&size=${size}`,
        method  : 'GET',
        json    : 'true',
        headers : req.headers
    };
    function onData(data){
        let embedded = data._embedded || {profileSurveyResponses:[]};
        embedded.page = data.page;
        res.json(embedded);
    }

    function onError(errorResponse){
        let error = errorResponse.error;
        res.json({error})
    }

    requestPromise(options).then(onData).catch(onError);
});

router.get('/responses/:id',(req,res)=>{
    req.pipe(request.get(baseURI + req.originalUrl)).pipe(res);
});

router.get('/responses/submitted',bodyParser.urlencoded({ extended: false }),(req,res)=>{
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let options = {
        url     : `${baseURI}/api/profile/responses/submitted?page=${page}&size=${size}`,
        method  : 'GET',
        json    : 'true',
        headers : req.headers
    };
    function onData(data){
        let embedded = data._embedded || {profileSurveyResponses:[]};
        embedded.page = data.page;
        res.json(embedded);
    }

    function onError(errorResponse){
        let error = errorResponse.error;
        res.json({error})
    }

    requestPromise(options).then(onData).catch(onError);
});

router.get('/responses/answering',bodyParser.urlencoded({ extended: false }),(req,res)=>{
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let options = {
        url     : `${baseURI}/api/profile/responses/answering?page=${page}&size=${size}`,
        method  : 'GET',
        json    : 'true',
        headers : req.headers
    };
    function onData(data){
        let embedded = data._embedded || {profileSurveyResponses:[]};
        embedded.page = data.page;
        res.json(embedded);
    }

    function onError(errorResponse){
        let error = errorResponse.error;
        res.json({error})
    }

    requestPromise(options).then(onData).catch(onError);
});

module.exports = router;