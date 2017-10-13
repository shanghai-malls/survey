import {Survey as ActionType} from './action-type'


const SURVEY_VIEW_INIT_STATE = {
    survey:{
        setting:{}
    },
    response:{
        items:[]
    },
    questions:[],
    view:{
        page : 'initialize'
    },
    error: undefined
};

function Survey(input = SURVEY_VIEW_INIT_STATE,action){
    let state = {...input};
    if(ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA === action.type) {
        // customSurveyResponse(action);
        if(action.payload) {
            state = {...action.payload};

            let {survey,response,questions,urlDefaultAnswers} = state;

            let view = {page:'welcome'};

            if(survey && response && questions){
                state.questions = mapQuestions(survey,response,questions,urlDefaultAnswers);

                let now = new Date();
                console.log(`答题计时开始：${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
                response.startAnswerTime = now;
                response.prevAnswerTime = now;

                calculationViewState(survey,response, state.questions, view);
            }
            state.view = view;
            if(!state.survey) {
                state.survey = SURVEY_VIEW_INIT_STATE.survey;
            }
        } else {
            state = SURVEY_VIEW_INIT_STATE;
        }
    }
    else if(ActionType.SUBMIT_RESPONSE_ITEMS === action.type){
        let {error,questions} = action.payload;
        let {survey,response,urlDefaultAnswers} = state;
        if(error) {//提交答案被拒绝，比如：配额不满足、信息验证不通过、提前终止等等
            state.error = error;
        } else {//如果还有没有回答的问题
            state.questions = mapQuestions(survey,response,questions,urlDefaultAnswers);//设置新的问题
            calculationViewState(survey,response, state.questions, state.view);
        }
        state.view = {...state.view}
    }
    else if(ActionType.SUBMIT_RESPONSE === action.type){
        let error = action.payload.error;
        if(action.payload === "") {
            state.view.page = 'submitted';
        } else if(action.payload instanceof String){
            state.error = {message:action.payload}
        } else {
            state.error = error;//设置错误信息
        }
        state.view = {...state.view}
    }
    else if(ActionType.ADD_RESPONSE_ITEM === action.type) {
        let responseItems = state.response.items;
        let responseItem = action.responseItem;
        //如果答案有效
        if(responseItem.value) {
            for (let i = 0; i < responseItems.length; i++) {
                //如果该问题已经被回答，则让新回答覆盖原来的回答
                if(responseItems[i].questionId === responseItem.questionId) {
                    responseItems.splice(i,1,fillResponseItem(responseItem,state,responseItems[i]));
                }
            }
            //表示已经覆盖了，负责则push进去
            if(!responseItem.responseId) {
                responseItems.push(fillResponseItem(responseItem,state));
            }
        } else { //如果答案无效，则表示用户想取消这个答案
            for (let i = 0; i < responseItems.length; i++) {
                if(responseItems[i].questionId === responseItem.questionId) {
                    responseItems.splice(i,1); //删除原有答案
                }
            }
        }
        state.response.prevAnswerTime = new Date();

        state.response = {...state.response};
        state.view = calculationViewState(state.survey,state.response,state.questions,state.view);
    } else {
        state = SURVEY_VIEW_INIT_STATE
    }
    return state;
}


/**
 * 将问题和问卷答卷关联到一块
 * @param survey
 * @param response
 * @param questions
 * @param urlDefaultAnswers 从浏览器地址栏中获取到的答案
 */
function mapQuestions(survey,response,questions,urlDefaultAnswers){
    //计算出必需回答的问题数量 和 已经回答的问题列表
    survey.requiredCount = 0;
    return questions.map(question=>{
        let responseItem = response.items.find(item=>item.questionId === question.id);
        if(urlDefaultAnswers && urlDefaultAnswers[question.code]){
            if(!responseItem) {
                responseItem = {
                    value : urlDefaultAnswers[question.code],
                    responseId:response.id,
                    questionId:question.id,
                    interviewTime   :0
                };
                response.items.push(responseItem);
            }
        }
        if(!responseItem){
            responseItem = {
                responseId:response.id,
                questionId:question.id,
                interviewTime   :0,
            };
            if(question.value) {
                //如果问题有默认答案并且这个问题没有被回答，将会自动添加到已回答列表
                responseItem.value = question.value;
                responseItem.submitTime = new Date();
                response.items.push(responseItem);
            }
        }

        if(question.mandatory && question.type !== 'SECTION') {
            survey.requiredCount +=1;
        }

        return {survey,question,responseItem};
    });
}

function calculationViewState(survey,response,questionViewStates,view) {
    //判断问卷是否被逻辑终止
    let isTerminated = survey.setting.format === 'QUESTION_BY_QUESTION' && questionViewStates.length === 1 && questionViewStates[0].question.id === -1;

    if(isTerminated || questionViewStates.length === 0) {
        view.page = 'unsubmitted'; //待提交
    } else {
        let firstQuestion = questionViewStates[0].question;
        let effectiveItemCount = 0;
        for( let i = 0; i < response.items.length; i++ ){
            let responseItem = response.items[i];
            let qvs = questionViewStates.find(item=>item.question.id === responseItem.questionId);
            if(qvs.question.mandatory){
                effectiveItemCount++;
            }
        }
        view.page = 'answering';
        view.submitable = effectiveItemCount >= survey.requiredCount;
        view.progressRate = (firstQuestion.index - 1 + effectiveItemCount) / survey.questionCount * 100;
        view.progressRate = view.progressRate > 100 ? 100 : view.progressRate;
        view.disabledPrev = questionViewStates.some((qv) => qv.question.index === 1) || !survey.setting.allowPrev;
        view.last = true;
    }
    return {...view};
}

function fillResponseItem(responseItem,state,oldResponseItem){
    let prevAnswerTime = state.response.prevAnswerTime;

    responseItem.responseId = state.response.id;
    responseItem.submitTime = new Date();
    responseItem.interviewTime = (responseItem.submitTime.getTime() - prevAnswerTime.getTime()) / 1000; //当前回答时间 减去 上一个问题的回答提交时间
    if(oldResponseItem) {
        responseItem.interviewTime += oldResponseItem.interviewTime;
    }
    console.log(`本题耗时${responseItem.interviewTime}秒`);
    return responseItem;
}

function customSurveyResponse(action){

    action.payload = {
        survey:{id:'1',serviceId:1,userId:1,title:'性格情景调查',description:'测试的目的是反应最真实的足迹，而不是别人所期待的你。本测试时一种性格测试，从星座、血型、价值观等反应和描述测试者的性格特质。',welcomeText:'欢迎填写问卷',terminationText:'您不符合配额，提前终止',endText:'问卷到此结束，感谢你的参与！',endUrl:'/surveys',endUrlDescription:'回到问卷列表?',active:true,questionCount:10,startTime:'2010-01-01 10:00:00',expiryTime:'2020-01-01 10:00:00',createTime:'2020-01-01 10:00:00',updateTime:'2020-01-01 10:00:00',
            setting:{surveyId:1,responseLimit:30,template:'https://wj.qq.com/themes/enterprise/assets/background_mobile.jpg',format:'QUESTION_BY_QUESTION',locale:'zh_CN',accessRule:'PUBLIC',autoRedirect:false,showWelcome:false,showProgress:false,showGroupInfo:false,showQuestionIndex:false,showResponse:false,allowPrev:false,allowSuspend:false,allowEditAfterCompletion:false,enableCaptcha:false,enableAssessment:false}},
        response:{id:1,serviceId:1,userId:1,deviceId:'1',ipAddress:'127.0.0.1',accessToken:'123',lastQuestionId:1,submitted:false,startTime:'2020-01-01 10:00:00',items:[]},
        questions: [],
        view : {
            page : 'unsubmitted'
        }
    };
    // action.payload.view.page = 'submitted';
    // action.payload.survey.setting.accessRule = 'TOKEN';
    // action.payload.survey.setting.showWelcome = true;
    // action.payload.response = undefined;
    action.payload.survey.setting.enableCaptcha = true;
    // payload.survey.setting.showGroupInfo = false;
    // payload.survey.setting.template='https://wj.qq.com/themes/enterprise/assets/background_mobile.jpg';

    // action.payload.survey.setting.showQuestionIndex = true;
    // action.payload.error = {"message": "你没有权限回答当前问卷，请更换账号"};
    // let questions = action.payload.questions;
    // let qid = 100;
    // let codeNo = 100;
    // let seq = 1;
    // questions.push({id:qid++,index:seq++,code:`question${codeNo++}`,surveyId:1,type:'RADIO',title:"请选择你的性别",help:'鼠标移动到某个选项上，并点击选中它',image:'http://oobtkwrkc.bkt.clouddn.com/101.jpg',mandatory:true,defaultAnswer:'male',jumpLogic:[],content:{layout:'V',other:true,options:[{value:'male',label:'我是GG',image:'http://otbo6p9vx.bkt.clouddn.com/02.gif'},{value:'female',label:'我是MM',image:'http://otbo6p9vx.bkt.clouddn.com/04.gif'},{value:'unknown',label:'我是人妖',image:'http://otbo6p9vx.bkt.clouddn.com/03.gif'},{value:'other',label:'其他', ext:true, extLabel:'补充答案'}]}});
    // questions.push({defaultAnswer:['male','female'],id:qid++,index:seq++,code:`question${codeNo++}`,surveyId:1,type:'CHECKBOX',title:"请选择你的性别",help:'鼠标移动到某个选项上，并点击选中它',mandatory:true,jumpLogic:[],content:{layout:'H',options:[{value:'male',label:'我是GG'},{value:'female',label:'我是MM'},{value:'unknown',label:'我是人妖'},]}});
    // questions.push({defaultAnswer:'basketball',id:qid++,index:seq++,code:`question${codeNo++}`,surveyId:1,type:'SELECT',title:"你的爱好",help:'鼠标移动到某个选项上，并点击选中它',mandatory:true,jumpLogic:[],content:{options:[{value:'basketball',label:'打篮球'},{value:'football',label:'踢足球'},{value:'skydiving',label:'跳伞'},]},});
    // questions.push({defaultAnswer:['basketball','basketball-01'],id:qid++,index:seq++,code:`question${codeNo++}`,surveyId:1,type:'MULTIPLE_SELECT',title:"你的爱好",mandatory:true,jumpLogic:[],content:{layout:'V',other:true,options:[{value:'basketball',label:'打篮球',children:[{value:'basketball-01',label:'打篮球-01',},{value:'basketball-02',label:'打篮球-02',}]},{value:'football',label:'踢足球',children:[{value:'football-01',label:'踢足球-01',},{value:'football-02',label:'踢足球-02',}]},{value:'skydiving',label:'跳伞',children:[{value:'skydiving-01',label:'skydiving-01',},{value:'skydiving-02',label:'跳伞-02',}]},]}});
    // questions.push({ id:qid++, title : "打分",     code: `question${codeNo++}`, index: seq++, mandatory: true ,defaultAnswer: 4.5, type:'RANKING'});
    // questions.push({ id:qid++, title : "多行文本", code: `question${codeNo++}`, index: seq++, mandatory: false ,type:'TEXT_AREA'});
    // questions.push({ id:qid++, title : "富文本",   code: `question${codeNo++}`, index: seq++, mandatory: false ,type:'RICH_TEXT_AREA'});
    // questions.push({ id:qid++, title : "电话号码", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'TELEPHONE_INPUT'});
    // questions.push({ id:qid++, title : "手机号码", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'CELLPHONE_INPUT'});
    // questions.push({ id:qid++, title : "时间/日期",code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'DATETIME_INPUT'});
    // questions.push({ id:qid++, title : "分段",     type:'SECTION'});
    // questions.push({ id:qid++, title : "单行文本", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'TEXT_INPUT'  });
    // questions.push({ id:qid++, title : "数字填空", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'NUMBER_INPUT'});
    // questions.push({ id:qid++, title : "邮箱地址", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'EMAIL_INPUT'});
    // questions.push({ id:qid++, title : "请输入url",code: `question${codeNo++}`, index: seq++,defaultAnswer:'http://www.google.com', mandatory: true ,type:'URL_INPUT'});
    // questions.push({ id:qid++, title : "文字展示题",code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'TEXT_DISPLAY', content:"自爱残妆晓镜中，环钗谩篸绿丝丛。须臾日射燕脂颊，一朵红苏旋欲融。山泉散漫绕阶流，万树桃花映小楼。闲读道书慵未起，水晶帘下看梳头。红罗著压逐时新，吉了花纱嫩麹尘。"});
    // questions.push({ id:qid++, title : "图片展示题",code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'IMAGE_DISPLAY', content:"http://otbo6p9vx.bkt.clouddn.com/100.jpg"});
    // questions.push({ id:qid++, title : "音频展示题",code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'AUDIO_DISPLAY', content:"http://www.w3school.com.cn/i/song.mp3"});
    // questions.push({ id:qid++, title : "视频展示题",code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'VIDEO_DISPLAY', content:"http://www.w3school.com.cn/i/movie.mp4"});
    //
    // questions.push({ id:qid++, title : "文件上传", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'FILE_UPLOAD'});
    // questions.push({ id:qid++, title : "图片上传", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'IMAGE_UPLOAD'});
    // questions.push({ id:qid++, title : "语音上传", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'AUDIO_UPLOAD'});
    //
    // questions.push({ id:qid++, title : "微博转发", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'WEIBO_SHARE'});
    // questions.push({ id:qid++, title : "微信转发", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'WECHAT_SHARE'});
    //
    // questions.push({ id:qid,   title : "地理位置", code: `question${codeNo++}`, index: seq++, mandatory: true ,type:'GEO'});


}
export {Survey,mapQuestions}