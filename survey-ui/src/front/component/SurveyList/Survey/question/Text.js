import Question from './Question'
import React from 'react'
import {Message} from '../../../Message'
export class Text extends Question {

    getInputType(){
        let type = this.props.question.type;
        return type.toLowerCase().replace('_input','');
    }

    handleChange(event) {
        let inputType = this.getInputType();
        let value = event.target.value.trim();
        if(value) {
            if(inputType === 'text' || inputType === 'number' || inputType === 'datetime') {
                super.fillInResponse(value);
            } else {
                let pattern,message;
                if(inputType === 'cellphone' ){
                    message = '必须符合手机号码格式';
                    pattern = /^1[0-9]{10}$/
                }
                else if(inputType === 'telephone'){
                    message = '必须符合座机号码格式';
                    pattern = /^0[0-9]{2,3}-[0-9]{7,8}$/
                }
                else if(inputType === 'email'){
                    message = '必须符合email格式';
                    pattern = /^[\w_.]{3,50}@\w{1,50}\.[a-z]{1,10}$/;
                }
                else if(inputType === 'url'){
                    message = '必须符合url格式';
                    pattern = /^https?:\/\/\w+\.[a-z]{1,50}\S*$/;
                }
                if(value.search(pattern) !== -1) {
                    super.fillInResponse(value);
                } else {
                    super.resetResponse();
                    if(this.props.survey.setting.showQuestionIndex) {
                        Message.error({message:`问题Q${this.props.question.index}的答案${message}`})
                    } else {
                        Message.error({message:`问题[${this.props.question.message}]的答案${message}`})
                    }
                }
            }
        } else {
            super.resetResponse();
        }

    }

    body() {
        let required = this.props.question.mandatory;
        let defaultValue = this.state.value;
        let inputType = this.getInputType();
        if(inputType === 'datetime') {
            inputType = 'datetime-local';
        } else if(inputType === 'cellphone' || inputType === 'telephone'){
            inputType = 'text';
        }
        return (
            <div className="question-body text">
                <input type={inputType} className="form-control" disabled={this.props.readOnly} onBlur={this.handleChange.bind(this)} required={required} defaultValue={defaultValue}/>
            </div>
        )
    }
}