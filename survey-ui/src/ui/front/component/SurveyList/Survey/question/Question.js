import React from 'react';
import {Survey as ActionType} from '../../../../store/action-type'
import './index.css'
import {Message} from '../../../Message'
export default class Question extends React.Component {

    constructor(props){
        super(props);
        this.state = {value: props.responseItem.value};
    }

    render(){
        let {mandatory,index,image,title} = this.props.question;
        return (
            <div className='question' >
                <div className="question-heading">
                    <div className="question-title">
                        <span hidden={!this.props.survey.setting.showQuestionIndex}>Q{index}:&nbsp;&nbsp;</span>
                        <span className={mandatory ? 'required':''}>{title}</span>
                    </div>
                </div>
                <div className="question-ic" hidden={!image}>
                    <img alt="题图" src={image} />
                </div>
                {this.body()}
            </div>
        );
    }

    body(){
        throw new Error('必须覆盖body方法')
    }

    fillInResponse(value){
        if(!this.props.readOnly) {
            let dispatch = this.props.dispatch;
            let questionId = this.props.question.id;
            this.setState({value});

            dispatch({type:ActionType.ADD_RESPONSE_ITEM,responseItem:{questionId,value}});

            if(!value) {
                if(this.props.question.mandatory){
                    if(this.props.survey.setting.showQuestionIndex) {
                        Message.error({message:`Q${this.props.question.index}为必答问题`})
                    } else {
                        Message.error({message:`[${this.props.question.message}] 为必答问题`})
                    }
                }
            }
        }
    }
    resetResponse(){
        this.fillInResponse(undefined);
    }
}
