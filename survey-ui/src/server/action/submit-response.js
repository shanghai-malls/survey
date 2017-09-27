let express = require('express');
let router = express.Router({mergeParams:true});
let bodyParser = require('body-parser');
let request = require("request-promise-native");
let {baseURI,getRequestHeaders} = require("../common");



//提交问题
router.post('/items', bodyParser.json(),function(req, res) {
    res.contentType('application/json');

    let responseId = req.params.responseId;
    let surveyId = req.body.surveyId;
    let items = req.body.items;

    let origHeaders = req.headers;
    delete origHeaders['Content-Length'];
    delete origHeaders['Content-Type'];

    function submitAnswers(){
        let options = {
            method  :'POST',
            url     :`${baseURI}/api/surveys/${surveyId}/responses/${responseId}/items`,
            json    : true,
            body    : items,
            headers : origHeaders
        };
        return request(options);
    }

    function getNextQuestions(){//这个方法会传入上一个http请求的响应，我们这里忽略它
        let options = {
            method  : 'GET',
            json    : true,
            url     : `${baseURI}/api/surveys/${surveyId}/responses/${responseId}/questions`,
            headers : origHeaders
        };

        return request(options);
    }


    function checkQuestions(questions) {
        let terminated = questions.length === 1 && questions[0].id === -1;//问卷被终止
        if (terminated) {
            res.json({terminated});
        } else {
            res.json({questions});
        }
    }

    function onError(errorResponse) {
        res.json({error: errorResponse.error});
    }
    submitAnswers()
        .then(getNextQuestions)
        .then(checkQuestions)
        .catch(onError);

});

//提交答卷
router.put('/', bodyParser.urlencoded({extended:false}),function(req, res) {
    let responseId = req.params.responseId;
    let surveyId = req.body.surveyId;
    let origHeaders = getRequestHeaders(req);
    let options = {
        method  :'PUT',
        url     :`${baseURI}/api/surveys/${surveyId}/responses/${responseId}`,
        json    : true,
        headers : origHeaders
    };
    function onError(errorResponse) {
        let error = errorResponse.error;
        res.json({error});
    }

    request(options).catch(onError);
});


module.exports = router;
