import React, {Component} from "react";
import {connect} from "react-redux";
import "./index.css";
import {http,querystring} from '../../../utils'
import * as api from "../../../store/api";
import {Message} from "../../Message";

class SurveyResponseApp extends Component {

    componentWillMount(){
    	this.setState({
            survey:{questions:[],setting:{}},
			responses:[],
            displayOptions:{
                filtered:[],
                display:'input'
			}
		});
	}
	getDisplayOptionsFromSearch(filtered){
        const search = querystring.parse(this.props.location.search);
        if(search) {
            const keys = Object.keys(search);
            if(filtered.length > 0) {
                let filteredQuestion = filtered.find(q=>q.code === keys[0]), value = search[keys[0]];
                if(filteredQuestion) {
                    let displayOptions = this.getDisplayOptions(filteredQuestion);
                    displayOptions.filtered = filtered;
                    displayOptions.value = value;
                    return displayOptions;
                }
            }
        }
        return {filtered,display:'input'};
    }
    componentDidMount() {

        const surveyId = this.props.match.params.surveyId;
        const pathname = this.props.location.pathname;

        const fetchSurveyUrl = api.normalize(`${api.API_PREFIX}/surveys/${surveyId}?projection=full`);
        const fetResponsesUrl = api.normalize(`${api.API_PREFIX}/${pathname}`);
    	http.get(fetchSurveyUrl).then(survey=>{
            return http.get(fetResponsesUrl).then(({_embedded})=>{
                let filtered = survey.questions.filter(question=> question.type ==='RADIO' || question.type ==='SELECT' || question.type.endsWith("_INPUT"));
                let displayOptions = {filtered,display:'input'};
                this.setState({survey,displayOptions, ... _embedded});

                let searchDisplayOptions =  this.getDisplayOptionsFromSearch(filtered);
                if(searchDisplayOptions.value) {
                    this.filterResponse(searchDisplayOptions)
                }
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
	    if(!question) {
	        return {display:'input'};
        }
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
        let value = event.target.value;
        if (value ){
            let question = this.state.survey.questions.find(q=>String(q.id) === value);
            let displayOptions = this.getDisplayOptions(question);
            displayOptions.filtered = this.state.displayOptions.filtered;
            displayOptions.submitTime = this.state.displayOptions.submitTime;
            this.filterResponse(displayOptions);
        }
    }

    changeAnswer(event){
        let displayOptions = {...this.state.displayOptions};
        displayOptions.value = event.target.value;
        this.filterResponse(displayOptions);

    }
    changeDate(event){
        let displayOptions = {...this.state.displayOptions};
        displayOptions.submitTime = event.target.value;
        this.filterResponse(displayOptions);
    }

    filterResponse(displayOptions){
        let {questionId,value,submitTime} = displayOptions;
        let conditions = {};
        if(this.state.displayOptions.submitTime !== submitTime) {
            this.state.responses.forEach(r=>{
                const submitTimeMatches = new Date(r.submitTime).toLocaleDateString() === new Date(submitTime).toLocaleDateString();
                r.display = submitTimeMatches ? 'show' : 'hide';
            });

            conditions.submitTime = submitTime;
        }

        if( questionId === this.state.displayOptions.questionId ) {
            if( value && value !== this.state.displayOptions.value) {
                conditions.value = value;

            }
        } else {
            if( value) {
                conditions.value = value;
            }
        }

        this.state.responses.forEach(r=>{
            r.display = 'show';
            if(conditions.submitTime) {
                if(new Date(r.submitTime).toLocaleDateString() !== new Date(conditions.submitTime).toLocaleDateString()) {
                    r.display = 'hide';
                }
            }
            if(conditions.value) {
                if(r.display === 'show') {
                    let matchesItem = r.items.find(i=>{
                        return i.questionId === questionId && i.value === value;
                    });
                    r.display = matchesItem ? 'show' : 'hide';
                }
            }
        });

        this.setState({...this.state,displayOptions})
    }

	render(){
		const {filtered,display,options,questionId,value} = this.state.displayOptions;
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
							{filtered.map(q=><option value={q.id} key={q.id} selected={questionId === q.id}>{q.title}</option>)}
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
                                display === 'input' ? <input ref="answer" className="form-control" onChange={this.changeAnswer.bind(this)} value={value} /> : ''
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