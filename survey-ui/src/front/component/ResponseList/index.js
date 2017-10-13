import React,{Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {ResponseList as ActionType} from "../../store/action-type";
import * as api from "../../store/api";
import {http,querystring} from '../../utils'

class ResponseListApp extends Component {

	componentDidMount(){
        this.loadList(ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA);
	}

    loadList(type,page,size) {
        let {dispatch,location} = this.props;

        let params = querystring.parse(location.search) || {};

        if(page && size) {
            params.page = page;
            params.size = size;
        }
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}?${querystring.stringify(params)}`);

        http.get(url).then(resp => dispatch({type,payload:api.unwrappedEmbedded(resp)}));
    }

    loadNextList() {
        let {number,size} = this.props.page;
        this.loadList(ActionType.APPEND_PAGING_DATA_TO_VIEW_STATE,number+1,size);
    }

    getTitle(){
        let params = querystring.parse(this.props.location.search);
        if(!params){
            return '已参与'
        }
        if(params.submitted){
            return '已提交';
        } else {
            return '正在回答';
        }
    }

	render(){
        let {error,page} = this.props;
        let hasNext =  true;
        if(page){
            hasNext = page.totalPages-1 > page.number;
        }
		return (
			<div className="x-list-group-container">
				<h3>{this.getTitle()}</h3>
                {
                    error ? this.error() : this.responseList()
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

    responseList(){
        let profileSurveyResponses = this.props.profileSurveyResponses || [];
        return (
			<ul className="x-list-group">
                {
                    profileSurveyResponses.map(psr => {
                        return (
                            <li key={psr.response.id} className="x-list-item">
                                <h4>{psr.survey.title}</h4>
                                <div>
                                    <p>{psr.survey.description}</p>
                                    {
                                        psr.response.submitted ?
                                        <Link to={`/profile/responses/${psr.response.id}`} className="btn btn-warning">查看答卷</Link>
                                        :
                                        <Link to={`/surveys/${psr.survey.id}?responseId=${psr.response.id}`} className="btn btn-warning">继续答题</Link>
                                    }

                                </div>
                                <div>是否提交：{psr.response.submitted ? '是':'否'}</div>
                            </li>
                        );
                    })
                }
			</ul>
		);
    }
}

const mapStateToProps = ({responseListViewState})=>{
	return responseListViewState;
};

export const ResponseList = connect(mapStateToProps)(ResponseListApp);