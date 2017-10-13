import React, {Component} from "react";

import {connect} from "react-redux";

import {Optional} from "./question/Optional";
import {Select} from "./question/Select";
import {Ranking} from "./question/Ranking";
import {TextArea} from "./question/TextArea";
import {Text} from "./question/Text";
import {Section} from "./question/Section";
import {Display} from "./question/Display";
import {Share} from "./question/Share";
import {Geo} from "./question/Geo";
import {Uploader} from "./question/Uploader";
import {Message} from '../../Message'
import {Survey as ActionType} from "../../../store/action-type";
import * as api from "../../../store/api";
import {http,querystring} from '../../../utils'
import submittedImg from './image/submitted.png'
import "./index.css";

class SurveyApp extends Component {


    getUrlDefaultAnswers(){
        let queryParams = querystring.parse(this.props.location.search);
        if(queryParams) {
            let answers = {};
            for(let key of Object.getOwnPropertyNames(queryParams)) {
                let questionCode = key.replace("_default_","");
                answers[questionCode] = queryParams[key];
            }
            return answers;
        }
    }



    fetchOrCreateResponse(token){
        let storeResponse = response => {
            if(response.error) {
                alert(response.message);
                if(!token) {
                    this.dispatchAction(response);
                }
                return Promise.reject()
            } else {
                this.dispatchPayload.response = response;
            }
        };
        let {location} = this.props;
        let queryParams = querystring.parse(location.search);
        if(queryParams && queryParams.responseId){
            let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses/${queryParams.responseId}`);
            return http.get(url).then(storeResponse)
        } else {
            let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses`);
            return http.post(url).body(token).then(storeResponse);
        }
    }


    fetchQuestions(){
        let {location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses/${this.dispatchPayload.response.id}/questions`);
        return http.get(url).then(resp=>{
            this.dispatchPayload.questions = resp.questions;
            this.dispatchPayload.hasNext = resp.hasNext;
        });
    }

    dispatchAction(error)  {
        let {dispatch} = this.props;
        let type =  ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA;
        this.dispatchPayload.error = error;
        this.dispatchPayload.urlDefaultAnswers = this.getUrlDefaultAnswers();
        dispatch({type,payload:this.dispatchPayload})
    };

    fetchSurvey(){
        let {location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}?projection=detail`);

        return http.get(url).then(survey=>{
            let setting = survey.setting;
            if(setting===undefined){
                console.log("无法获取问卷的数据:",survey);
                return Promise.reject({message:"无法获取问卷的数据"});
            }
            this.dispatchPayload = {survey};
            let queryParams = querystring.parse(location.search);
            //是否是恢复答题？
            let fetch = queryParams && queryParams.responseId && queryParams.reedit;
            if(!fetch) {
                if(setting.showWelcome || setting.accessRule === 'TOKEN'){
                    return Promise.reject();
                }
            }
        });
    }
    componentDidMount(){
        this.dispatchPayload = {};

        this.fetchSurvey()
            .then(this.fetchOrCreateResponse.bind(this))
            .then(this.fetchQuestions.bind(this))
            .then(this.dispatchAction.bind(this))
            .catch(this.dispatchAction.bind(this));
    }

    startAnswer() {
        let {survey} = this.props;
        let token = null;
        if(survey.setting.accessRule === 'TOKEN'){
            if(!this.refs.token.value) {
                alert('请输入验证码');
            }
            token = {token:this.refs.token.value};
        }


        this.fetchOrCreateResponse(token)
            .then(this.fetchQuestions.bind(this))
            .then(this.dispatchAction.bind(this))
    }

    submitResponseItems(){
        let {response,hasNext,dispatch,location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses/${response.id}/items`);
        let type =  ActionType.SUBMIT_RESPONSE_ITEMS;

        http.post(url).contentType('application/json')
            .body(response.items)
            .then(resp=>{
                if(hasNext){
                    this.dispatchPayload.questions = resp.questions;
                    this.dispatchPayload.hasNext = resp.hasNext;
                    dispatch({type,payload:resp});
                } else {
                    dispatch({type,payload:{questions:[]}});
                }
            })
            .catch(resp=>dispatch({type,payload:{error:resp.error}}));

    }

    submitResponse(){
        let {response,dispatch,location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses/${response.id}`);
        let type =  ActionType.SUBMIT_RESPONSE;
        http.put(url).accept("*/*")
            .then(payload=>dispatch({type,payload}))
            .catch(resp=>{
                console.log(resp);
            });
    }

    submitAll(){
        let {response,dispatch,location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}/responses/${response.id}`);
        let type =  ActionType.SUBMIT_RESPONSE;
        http.post(url)
            .accept("*/*")
            .contentType('application/json')
            .body(response.items)
            .then(payload=>dispatch({type,payload}))
            .catch(resp=>{
                console.log(resp);
            });
    }

    static refreshCaptcha(event){
        event.target.src = `/api/captcha/${new Date().getTime()}`
    }

    startOrContinue(){
        let {location} = this.props;
        let queryParams = querystring.parse(location.search);
        if(queryParams && queryParams.responseId){
            return "继续答题";
        }
        return "开始答题";
    }

    goBackList(){
        this.props.history.push("/surveys");
    }

    render() {
        const {survey,questions,view,error} = this.props;

        Message.error(error);

        //初始状态
        let body = <div className="survey-body"><div className="welcome-text" style={{minHeight:"800px"}}>问卷数据加载中...</div></div>;

        if(view.page === 'welcome'){//欢迎页
            body = (
                <div className="survey-body">
                    <div className="welcome-text">{survey.welcomeText}</div>
                    {
                        survey.setting.accessRule === 'TOKEN'?
                            <input type="text" className="form-control token-input" placeholder="请填写token" ref='token' /> : ""

                    }
                    <button className="btn-warning btn start-btn" type="button" onClick={this.startAnswer.bind(this)}>{this.startOrContinue()}</button>
                </div>
            );
        }
        
        else if(view.page === 'answering'){//答题页
            //如果没有开启验证码，并且没有下一批问题，则直接提交
            let submitAll = !survey.setting.enableCaptcha && !this.props.hasNext;
            if(questions.length > 0){
                body = (
                    <form className="form-horizontal">
                        {questions.map(q=>this.question(q))}
                        <div className="footer-bar">
                            <button type="button" className="btn btn-warning btn-lg" disabled={view.disabledPrev}>上一步</button>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {
                                submitAll?
                                    <button type="button" className="btn btn-info btn-lg" onClick={this.submitAll.bind(this)} disabled={!view.submitable}>提交答案</button>
                                    :
                                    <button type="button" className="btn btn-info btn-lg" onClick={this.submitResponseItems.bind(this)} disabled={!view.submitable}>下一步</button>
                            }
                        </div>
                    </form>
                );
            }
        }

        else if(view.page === 'unsubmitted'){ //待提交页
            return this.unsubmittedPage();
        }
        
        else if(view.page === 'submitted'){ //提交结束页
            return this.submittedPage();
        }

        return (
            <div className="survey">
                <div className="survey-title">
                    <div className="Title">{survey.title}</div>
                    <div className="survey-description">
                        <p>{survey.description}</p>
                    </div>
                </div>
                {body}
                <div className={survey.setting.showProgress ? "progress-indicator" : "hidden"} style={{width:`${view.progressRate}%`}}/>
                <div className="back-color" />
                {survey.setting.template ? <div className="background-template" style={{backgroundImage:`url(${survey.setting.template})`}} /> : ""}
            </div>
        );
    }
    unsubmittedPage(){
        const {survey,questions} = this.props;
        let text = "所有问题都已答完，请提交答卷";
        if(questions.length === 1) {
            text = survey.terminationText;
        }
        return (
            <div className="survey">
                <div className="survey-body flex-box">
                    <div className="unsubmitted-text">{text}</div>
                    {
                        survey.setting.enableCaptcha?
                            <div className="captcha-container">
                                <input placeholder="请输入验证码"/>
                                <img src={`/api/captcha/${new Date().getTime()}`} onClick={SurveyApp.refreshCaptcha} alt="验证码"/>
                            </div>
                            :
                            <div className="captcha-container" />
                    }
                    <button type="button" className="btn-warning btn-lg btn submit-btn btn_submit" onClick={this.submitResponse.bind(this)}>提交答卷</button>
                </div>
                <div className="back-color" />
                <div className="background-template" style={{backgroundImage:`url(${survey.setting.template})`}} />
            </div>
        )
    }

    submittedPage(){
        const {survey} = this.props;
        return (
            <div className="survey">
                <div className="submitted flex-box">
                    <img src={submittedImg} alt="问卷结束" />
                    <div className="end-text">{survey.endText}</div>
                    <a href={survey.endUrl}><h4>{survey.endUrlDescription}</h4></a>
                </div>
                <div className="back-color" />
                <div className="background-template" style={{backgroundImage:`url(${survey.setting.template})`}} />
            </div>
        )
    }

    terminatedPage(){
        const {error} = this.props;
        return (
            <div className="survey">
                <div className="survey-body">
                    <h1 className="error-text">{error.message}</h1>
                    <button className="btn-warning btn btn-lg go-back-btn" type="button" onClick={this.goBackList.bind(this)}>
                        返回列表
                    </button>
                </div>
                <div className="back-color" />
            </div>
        )
    }

    question(props){
        let dispatch = this.props.dispatch;
        let survey = this.props.survey;
        props.dispatch = dispatch;
        props.key = props.question.id;

        switch(props.question.type){
            case 'RADIO':
            case 'CHECKBOX':
                return <Optional        {...props}/>
            case 'SELECT':
            case 'MULTIPLE_SELECT':
                return <Select          {...props}/>
            case 'TEXT_AREA':
            case 'RICH_TEXT_AREA':
                return <TextArea        {...props}/>
            case 'TEXT_INPUT':
            case 'NUMBER_INPUT':
            case 'EMAIL_INPUT':
            case 'URL_INPUT':
            case 'TELEPHONE_INPUT':
            case 'CELLPHONE_INPUT':
            case 'DATETIME_INPUT':
                return <Text            {...props}/>
            case 'RANKING':
                return <Ranking         {...props}/>
            case 'SECTION':
                if(survey.setting.showGroupInfo) {
                    return <Section     {...props}/>
                }
                break;//忽略
            case 'TEXT_DISPLAY':
            case 'IMAGE_DISPLAY':
            case 'AUDIO_DISPLAY':
            case 'VIDEO_DISPLAY':
                return <Display         {...props}/>
            case 'FILE_UPLOAD':
            case 'IMAGE_UPLOAD':
            case 'AUDIO_UPLOAD':
                return <Uploader          {...props}/>
            case 'WEIBO_SHARE':
            case 'WECHAT_SHARE':
                return <Share           {...props}/>
            case 'GEO':
                return <Geo             {...props}/>
            default:
                return <div>不支持的题型：<code>{props.question.type}</code></div>
        }
    }

}

const mapStateToProps = ({surveyViewState}) => surveyViewState;

export const Survey = connect(mapStateToProps)(SurveyApp);
