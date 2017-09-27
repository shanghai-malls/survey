import React, {Component} from "react";
import {connect} from "react-redux";
import "./index.css";
import {http} from '../../../utils'
import * as api from "../../../store/api";
import {Message} from "../../Message";


class SurveyResponseApp extends Component {

    componentWillMount(){
    	this.setState({
            survey:{questions:[],setting:{}},
			responses:[],
            displayOptions:{
                filtered:[]
			}
		});
	}
    componentDidMount() {
    	let surveyId = this.props.match.params.surveyId;
    	let pathname = this.props.location.pathname;

        let fetchSurveyUrl = api.normalize(`${api.API_PREFIX}/surveys/${surveyId}?projection=full`);
		let fetResponsesUrl = api.normalize(`${api.API_PREFIX}/${pathname}`);
    	http.get(fetchSurveyUrl).then(survey=>{
            return http.get(fetResponsesUrl).then(({_embedded})=>{
                let filtered = survey.questions.filter(question=> question.type ==='RADIO' || question.type ==='SELECT' || question.type.endsWith("_INPUT"));
                let displayOptions = {filtered};
                if(filtered.length > 0) {
                    displayOptions = this.getDisplayOptions(filtered[0]);
                    displayOptions.filtered = filtered;
				}
                this.setState({survey,displayOptions, ... _embedded});
            });
		}).catch(error=>{
			Message.error(error)
		});

	}

	thead(){
        const {questions} = this.state.survey;
    	return (
			<thead>
			<tr>
				{questions.map(q=><th key={q.id}>{q.title}</th>)}
			</tr>
			</thead>
		)
	}
	tbody(){
        let {responses} = this.state;
		return (
			<tbody>
            {
                responses.filter(r=>r.display !== 'hide').map(response=>{
                    return (
						<tr key={response.id}>
                            {
                                this.fillNull(response).map(item=>{
                                    return <td key={item.responseId+'-'+item.questionId}>{item.text}</td>
                                })
                            }
						</tr>
                    );
                })
            }
			</tbody>
		);
	}
	fillNull(response){
        const {questions} = this.state.survey;
        let items = [];
        questions.map(question=>{
            let notNullItem = response.items.find(item => item.questionId === question.id);
            if(notNullItem){
                items.push(notNullItem);
                if(question.type === 'RADIO' || question.type ==='SELECT'){
                    let options = question.content.options;
                    let option = options.find(op=>op.value===notNullItem.value);
                    if(option) {
                    	notNullItem.text = option.label;
					}
				} else if(question.type === 'CHECKBOX'){
                    let options = question.content.options;
                    let labels = [];
                    for(let i = 0; i < notNullItem.value.length; i++) {
                        for (let j = 0; j < options.length; j++) {
                            let option = options[j];
                            if(option.value === notNullItem.value[i]) {
                                labels.push(option.label);
                            }
                        }
                    }
                    notNullItem.text = labels.join(', ');
				} else if(question.type ==='MULTIPLE_SELECT'){
                    let options = question.content.options;
                    let labels = [];
                    for(let i = 0; i < notNullItem.value.length; i++){
                        for(let j = 0; j < options.length; j++){
                            let option = options[j];
                            if(option.value === notNullItem.value[i]) {
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
                    notNullItem.text = labels.join(', ');
				} else if(typeof notNullItem.value ==='object'){
                    notNullItem.text = JSON.stringify(notNullItem.value);
                } else {
                    notNullItem.text = notNullItem.value
                }
            } else {
                items.push({value:'',text:'未做答',responseId:response.id,questionId:question.id})
            }
        });
        return items;
	}

    getDisplayOptions(question){
        let display,options,questionId = question.id;
        if( question.type ==='RADIO' || question.type ==='SELECT'){
            display = 'select';
            options = question.content.options;
        } else if(question.type.endsWith("_INPUT")) {
            display = 'input';
        }
        return {display,options,questionId};
    }

    changeQuestion(event){
        const value = event.target.value;
        if (value ){
            const question = this.state.survey.questions.find(q=>String(q.id) === value);
            const displayOptions = this.getDisplayOptions(question);
            displayOptions.filtered = this.state.displayOptions.filtered;
            displayOptions.submitTime = this.state.displayOptions.submitTime;
            this.filterResponse(displayOptions);
        }
    }

    changeAnswer(event){
        const displayOptions = this.state.displayOptions;
        displayOptions.value = event.target.value;
        this.filterResponse(displayOptions);

    }
    changeDate(event){
        const displayOptions = this.state.displayOptions;
        displayOptions.submitTime = event.target.value;
        this.filterResponse(displayOptions);
    }
    filterResponse(displayOptions){
        let {questionId,value,submitTime} = displayOptions;
        this.state.responses.forEach(r=>{
            let matchesItem = r.items.find(i=>{
                let result = i.questionId === questionId && i.value === value || !value;
                if(submitTime && result) {
                    result = new Date(i.submitTime).toLocaleDateString() === new Date(submitTime).toLocaleDateString();
                }
                return result;
            });
            r.display = matchesItem ? 'show' : 'hide';
        });
        this.setState({...this.state,displayOptions})
    }

	render(){
		const {filtered,display,options} = this.state.displayOptions;
		return (
			<div className="table-responsive survey-response">
				<form className="form-inline">
					<div className="form-group">
						<label className="control-label">提交日期：</label>
						<input type="date" className="form-control" ref="submitTime" placeholder="选择提交日期" onChange={this.changeDate.bind(this)}/>
					</div>
					<div className="form-group">
						<label className="control-label">选择问题：</label>
						<select className="form-control" ref="question" onChange={this.changeQuestion.bind(this)}>
							<option>--选择问题--</option>
							{filtered.map(q=><option value={q.id} key={q.id}>{q.title}</option>)}
						</select>
					</div>
					<div className="form-group">
						<label className="control-label">选择答案：</label>
						{
							display === 'select' ?
								<select className="form-control" ref="answer" onChange={this.changeAnswer.bind(this)}>
									<option>--选择答案--</option>
									{options.map(q=><option value={q.value} key={q.value}>{q.label}</option>)}
								</select>
								:
                                display === 'input' ? <input ref="answer" className="form-control" onChange={this.changeAnswer.bind(this)} /> : ''
						}

					</div>
				</form>

				<table className="table table-bordered table-striped">
					{this.thead()}
					{this.tbody()}
				</table>
			</div>
		)
	}



}
function mapStateToProps({surveyResponseViewState}){
	return surveyResponseViewState;
}
export const SurveyResponse = connect(mapStateToProps)(SurveyResponseApp);