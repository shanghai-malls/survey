import React, {Component} from "react";

import {connect} from "react-redux";

import {Optional} from "../../SurveyList/Survey/question/Optional";
import {Select} from "../../SurveyList/Survey/question/Select";
import {Ranking} from "../../SurveyList/Survey/question/Ranking";
import {TextArea} from "../../SurveyList/Survey/question/TextArea";
import {Text} from "../../SurveyList/Survey/question/Text";
import {Section} from "../../SurveyList/Survey/question/Section";
import {Display} from "../../SurveyList/Survey/question/Display";
import {Share} from "../../SurveyList/Survey/question/Share";
import {Geo} from "../../SurveyList/Survey/question/Geo";
import {Uploader} from "../../SurveyList/Survey/question/Uploader";

import {ProfileResponse as ActionType} from "../../../store/action-type";
import * as api from "../../../store/api";
import {http} from '../../../utils'
import "../../SurveyList/Survey/index.css";


class ProfileResponseApp extends Component {


    componentDidMount(){
        let {location,dispatch} = this.props;
        let payload = {};

        function fetchResponse(){
            let storeResponse = response => {
                if(response.error) {
                    return Promise.reject({message:'无法获取答卷数据'});
                } else {
                    payload.response = response;
                }
            };
            let url = api.normalize(`${api.API_PREFIX}/${location.pathname}`);
            return http.get(url).then(storeResponse)
        }

        function fetchSurvey(){
            let response = payload.response;
            let url = api.normalize(`${api.API_PREFIX}/surveys/${response.surveyId}?projection=full`);

            return http.get(url).then(survey=>{
                payload.survey = survey;
            });
        }

        function dispatchAction(error)  {
            let type =  ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA;
            payload.error = error;
            dispatch({type,payload})
        }

        fetchResponse()
            .then(fetchSurvey)
            .then(dispatchAction)
            .catch(dispatchAction)
    }

    reeditAnswer(){
        let {survey,response} = this.props;
        this.props.history.push(`/surveys/${survey.id}?responseId=${response.id}&reedit=true`);
    }

    goBackList(){
        this.props.history.push(`/profile/responses`);
    }

    render() {
        const {survey,questions,error} = this.props;
        //初始状态
        let body = <div className="survey-body"><h1 className="welcome-text" style={{minHeight:"800px"}}>问卷数据加载中...</h1></div>;
        if(error){
            body = (
                <div className="survey-body">
                    <h1 className="error-text">{error.message}</h1>
                    <button className="btn-warning btn btn-lg" type="button" onClick={this.goBackList.bind(this)}>
                        返回列表
                    </button>
                </div>
            );
        } else if(questions && questions.length>0){
            let isEffective = survey.active && new Date(survey.expiryTime).getTime() > new Date().getTime();
            body = (
                <form className="form-horizontal">
                    {questions.map(q=>this.question(q))}
                    <div className="footer-bar">
                        <button className="btn-warning btn btn-lg" type="button" onClick={this.reeditAnswer.bind(this)}
                                disabled={!survey.setting.allowEditAfterCompletion || !isEffective}>重新编辑答案</button>
                    </div>
                </form>
            );
        }

        return (
            <div className="survey">
                <div className="survey-title">
                    <h3>{survey.title}</h3>
                </div>
                <div className="survey-description">
                    <p>{survey.description}</p>
                </div>
                {body}
                <div className="back-color" />
            </div>
        );
    }

    question(props){
        let survey = this.props.survey;
        props.dispatch = this.props.dispatch;
        props.key = props.question.id;
        props.readOnly = true;
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

const mapStateToProps = ({profileResponseViewState}) => {
    return profileResponseViewState;
};

export const ProfileResponse = connect(mapStateToProps)(ProfileResponseApp);
