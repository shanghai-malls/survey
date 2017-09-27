const express = require('express');
const surveys = require("./action/surveys");
const profile = require("./action/profile");
const upload = require("./action/upload");
const captcha = require("./action/captcha");
const submitResponse = require("./action/submit-response");
const createResponse = require("./action/create-response");
const proxy = require("./action/proxy");
const session = require('express-session');
const {sessionIdSecret} = require('./common');

function addRoute(app) {
    app.get('/health',(req,res) => res.end({status: "UP"}));
    app.use(session({
        name:'JSESSIONID',
        secret: sessionIdSecret,
        resave: false,
        rolling: false,
        unset: 'keep',
        cookie: {
            maxAge: 60000 * 30,
            httpOnly: false,
            path: '/',
            sameSite: 'lax',
            secure: false
        }
    }));

    app.use('/api',(req,res,next) => {
        console.log("SessionId============>",req.sessionID);

        req.headers['tenant-id'] = 'default';
        req.headers['cookie'] = `JSESSIONID=${req.sessionID}`;
        next();
    });

    // app.use('/api/responses/:responseId',submitResponse);
    // app.use('/api/surveys/:surveyId/responses',createResponse);
    // app.use('/api/surveys',surveys);

    app.use('/api/profile', profile);
    app.use('/api/upload',  upload);
    app.use('/api/surveys', proxy);

    app.use('/captcha',captcha);//验证码
}


module.exports = addRoute;
