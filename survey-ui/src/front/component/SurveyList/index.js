import React, {Component} from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {SurveyList as ActionType} from "../../store/action-type";
import * as api from "../../store/api";
import {http} from '../../utils/http'
import "./index.css";
class SurveyListApp extends Component {


    componentDidMount() {
        this.loadList(ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA);
	}

    loadList(type,page,size) {
        let {dispatch,location} = this.props;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}?projection=basic`);
        if(page && size) {
            url += `&page=${page}&size=${size}`;
		}

		http.get(url).then(resp => dispatch({type,payload:api.unwrappedEmbedded(resp)}));
    }

	loadNextList() {
        let {number,size} = this.props.page;
		this.loadList(ActionType.APPEND_PAGING_DATA_TO_VIEW_STATE,number+1,size);
	}


	render(){
    	let {error,page} = this.props;
    	let hasNext =  true;
    	if(page){
            hasNext = page.totalPages-1 > page.number;
		}
		return (
			<div className="x-list-group-container">
				<h3>问卷列表</h3>
				{
					error ? this.error() : this.surveyList()
				}
				<p className="list-bottom-banner">
					{hasNext ? <a onClick={this.loadNextList.bind(this)}>点击加载更多</a> : '已没有更多~'}
				</p>
			</div>
		)
	}

	error(){
		return (
			<h4 className="center">服务暂时不可用</h4>
		)
	}

	surveyList(){
		let surveys = this.props.surveys;
        return (
			<ul className="x-list-group">
				{
                    surveys.map((survey)=>{
                        return(
							<li key={survey.id} className="x-list-item">
								<h4>{survey.title}</h4>
								<div>
									<p>{survey.description}</p>
									<Link to={`/surveys/${survey.id}`} className="btn btn-info">参与问卷</Link>
								</div>
								<div><Link to={`/surveys/${survey.id}/responses`}> 查看详情</Link></div>
							</li>
                        )
                    })
				}
			</ul>
		)
	}

}
function mapStateToProps({surveyListViewState}){
	return surveyListViewState;
}
export const SurveyList = connect(mapStateToProps)(SurveyListApp);