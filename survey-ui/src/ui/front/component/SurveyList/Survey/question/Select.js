import React from "react";
import Question from "./Question";
import "rc-cascader/assets/index.css";
import Cascader from "rc-cascader";

class Select extends Question {

    constructor(props){
        super(props);

        if(this.state.value ) {
            if(! (this.state.value instanceof Array)){
                this.state.value = [this.state.value];
            }
            let options =  props.question.content.options;
            let labels = [];
            for(let i = 0; i < this.state.value.length; i++){
                for(let j = 0; j < options.length; j++){
                    let option = options[j];
                    if(option.value === this.state.value[i]) {
                        labels.push(option.label);
                        if(option.children) {
                            options = option.children;
                            j = 0;
                        } else {
                            break;
                        }
                    }
                }
            }
            this.state.inputValue = labels.join(', ');
        }
    }
    onChange = (value, selectedOptions) => {
        let state = {
            value: selectedOptions.map(o => o.value),
            inputValue: selectedOptions.map(o => o.label).join(', ')
        };
        super.fillInResponse(state.value);
        this.setState(state);
    };

    body(){

        return (
            <div className="question-body select">
                <Cascader options={this.props.question.content.options} disabled={this.props.readOnly} onChange={this.onChange} defaultValue={this.state.value} transitionName="slide-up">
                    <input className="form-control" value={this.state.inputValue} readOnly  />
                </Cascader>
            </div>

        );
    }
}

export {Select}