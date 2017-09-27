const express = require('express');
const router = express.Router({mergeParams:true});
const request = require("request-promise-native");
const {baseURI} = require("../common");

const bodyParser = require('body-parser');

const mid = [bodyParser.urlencoded({extended:false})];
//参与问卷，创建一份新答卷
router.post('/',mid,function(req, res) {
    let surveyId = req.params.surveyId;
    let token = req.body.token || req.query.token;
    let origHeaders = req.headers;


    let responseData= {};
    function fetchSurvey(){
        let options = {
            method  :'GET',
            url     :`${baseURI}/api/surveys/${surveyId}?projection=detail`,
            json    : true,
            headers : origHeaders
        };

        return request(options).then(survey=>{
            responseData = {survey};
        });
    }

    function createResponse(){

        let options = {
            method  :'POST',
            url     :`${baseURI}/api/surveys/${surveyId}/responses`,
            json    : true,
            headers : origHeaders,
            body    : `token=${token}`
        };
        return request(options).then(response=>{
            responseData.response = response;
        });
    }

    function getNextQuestions(){
        let options = {
            method  : 'GET',
            json    : true,
            url     :`${baseURI}/api/surveys/${surveyId}/responses/${responseData.response.id}/questions`,
            headers :origHeaders
        };

        return request(options).then(response=>{
            let embedded = response._embedded;
            responseData.questions = embedded.questions;
        });
    }

    function checkQuestions() {
        let questions = responseData.questions;
        let terminated = questions.length === 1 && questions[0].id === -1;//问卷被终止
        if (terminated) {
            responseData.error = { message : responseData.survey.terminationText };
        }

        res.json(responseData);
    }

    function onError(errorResponse){
        responseData.error = errorResponse.error;
        res.json(responseData);
    }


    fetchSurvey()
        .then(createResponse)
        .then(getNextQuestions)
        .then(checkQuestions)
        .catch(onError);
});


module.exports = router;
