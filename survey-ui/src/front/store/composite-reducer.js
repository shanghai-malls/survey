import * as ActionType from './action-type'
import {Survey,mapQuestions} from './survey-reducer'

import {combineReducers} from 'redux';


const SURVEY_LIST_VIEW_INIT_STATE = {
    surveys:[]
};
//处理SurveyList组件
function SurveyList(state = SURVEY_LIST_VIEW_INIT_STATE,action) {
    if(ActionType.SurveyList.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {
        return action.payload;
    } else if(ActionType.SurveyList.APPEND_PAGING_DATA_TO_VIEW_STATE === action.type){
        let surveys = action.payload.surveys;
        action.payload.surveys = state.surveys.concat(surveys);
        return action.payload;
    }
    return state;
}

const SURVEY_RESPONSE_VIEW_INIT_STATE={
    survey:{
        setting:{},
        questions:[]
    },
    responses:[]
};

function SurveyResponse(state = SURVEY_RESPONSE_VIEW_INIT_STATE,action) {
    if(ActionType.SurveyResponse.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {

    } else {
        state = SURVEY_RESPONSE_VIEW_INIT_STATE;
    }
    return state;
}


const RESPONSE_LIST_VIEW_INIT_STATE = {
    profileSurveyResponses:[]
};
function ResponseList(state = RESPONSE_LIST_VIEW_INIT_STATE,action){
    if(ActionType.ResponseList.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {
        return action.payload;
    } else if(ActionType.ResponseList.APPEND_PAGING_DATA_TO_VIEW_STATE === action.type) {
        let data = action.payload.profileSurveyResponses;
        action.payload.profileSurveyResponses = state.profileSurveyResponses.concat(data);
        return action.payload;
    }
    return state;
}


const PROFILE_VIEW_INIT_STATE = {
    profile:{}
};
function Profile(state = PROFILE_VIEW_INIT_STATE,action) {
    if(ActionType.Profile.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {
        return action.payload;
    }
    return state;
}

const PROFILE_RESPONSE_VIEW_INIT_STATE={
    survey:{
        setting:{}
    },
    response:{
        items:[]
    },
    questions:[]
};

function ProfileResponse(state = PROFILE_RESPONSE_VIEW_INIT_STATE,action) {
    if(ActionType.ProfileResponse.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {
        if(action.payload.error) {
            let error = action.payload.error;
            return {error,...PROFILE_RESPONSE_VIEW_INIT_STATE}
        }
        let {survey,response} = action.payload;
        let questions = mapQuestions(survey,response,survey.questions);

        return {survey,response,questions};
    } else {
        state = PROFILE_RESPONSE_VIEW_INIT_STATE;
    }
    return state;
}



export let compositeReducers = combineReducers({
    surveyListViewState     : SurveyList,
    surveyViewState         : Survey,
    surveyResponseViewState : SurveyResponse,

    profileViewState        : Profile,
    responseListViewState   : ResponseList,
    profileResponseViewState: ProfileResponse,
});

