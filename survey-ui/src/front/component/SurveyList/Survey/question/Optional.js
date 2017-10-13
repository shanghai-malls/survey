import React  from 'react';
import Question from './Question'


class Optional extends Question {

    body(){
        let type = this.props.question.type.toLowerCase();
        let inputName = this.props.question.code;
        let {options,layout} = this.props.question.content;

        //如果选项有图片或者配置的布局为水平布局
        let verticalLayout = options.some((option) => option.image || option.ext) || layout === 'V';
        if(verticalLayout){
            return (
                <ul className="question-body x-list-group optional">
                    {
                        options.map((option) => {
                            return (
                                <li key={option.value} className="x-list-item">
                                    {
                                        this.option(option,type,inputName,type)
                                    }
                                    {
                                        option.image? <img src={option.image} alt="选项图片" /> : <span />
                                    }
                                </li>
                            )
                        })
                    }
                </ul>
            );
        } else {
            return (
                <div className="question-body optional">
                    {
                        options.map((option) => {
                            return this.option(option,`${type}-inline`,inputName,type);
                        })
                    }
                </div>
            )
        }
    }

    option(option,optionClass,questionName,type){
        let answer = this.getOptionAnswer(option);
        return (
            <div key={option.value} className={optionClass}>
                <label>
                    <input type={type} name={questionName} value={option.value} onClick={this.handleClick.bind(this)} defaultChecked={answer} disabled={this.props.readOnly}/>
                    <span>{option.label}</span>
                    {
                        option.ext ? <input name="ext" type="text" className="optional-input" placeholder={option.extLabel} onChange={this.handleChange.bind(this)} defaultValue={answer?answer.text:''} disabled={this.props.readOnly} /> : ""
                    }
                </label>
            </div>
        )
    }

    getOptionAnswer(option){
        let value = this.state.value;
        if(value){
            let type = this.props.question.type;
            let optionValue = option.value;
            let answer;
            if(type === 'CHECKBOX') {
                answer =  value.find(item=>{
                    return option.ext ? item.code === optionValue : item === optionValue
                });
            } else if(option.ext ? value.code === optionValue : value === optionValue) {
                answer = value;
            }

            return answer;
        }
    }

    handleClick(event){
        let element = event.target;
        let code = element.value;
        let input = element.nextElementSibling.nextElementSibling;
        let answer = input ? {code, text: input.value} : code;
        if(event.target.type === 'radio') {
            super.fillInResponse(answer)
        } else if(event.target.type === 'checkbox'){
            let value = this.state.value || [];

            if(!event.target.checked){
                for (let i = 0; i < value.length; i++){
                    if(value[i] === event.target.value){
                        value.splice(i,1);
                    }
                }
            } else {
                value.push(answer);
            }
            if(value.length === 0) {
                super.resetResponse();
            } else {
                super.fillInResponse(value)
            }
        }
    }
    handleChange(event){
        let element = event.target;
        let text = element.value;
        let option = element.previousElementSibling.previousElementSibling;
        let answer = {code: option.value, text};

        if(option.checked) {
            if(option.type === 'radio') {
                super.fillInResponse(answer)
            } else if(option.type === 'checkbox'){
                this.state.value.forEach(item => {
                    if(item.code === option.value) {
                        item.text =  text;
                    }
                });
                super.fillInResponse(this.state.value);
            }

        }
    }

}

export {Optional}