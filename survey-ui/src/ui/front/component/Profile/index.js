import React,{Component} from 'react';
import {connect} from 'react-redux'

import {Profile as ActionType} from '../../store/action-type'
import * as api from "../../store/api";
import {http} from '../../utils/http'
import {Link} from "react-router-dom";
class ProfileApp extends Component {


	componentDidMount(){
        let {dispatch,location} = this.props;
        let type = ActionType.UPDATE_VIEW_STATE_BY_FETCHED_DATA;
        let url = api.normalize(`${api.API_PREFIX}/${location.pathname}`);
        http.get(url).then(profile => dispatch({type,payload:{profile}}));
	}

	render(){
		let {profile} = this.props;
		return (
			<div className="x-list-group-container">
				<h3>个人中心</h3>
				<ul className="x-list-group">
					<li className="x-list-item">已参与：<Link to={`/profile/responses`} >{profile.totalCount}</Link></li>
					<li className="x-list-item">已提交：<Link to={`/profile/responses?submitted=true`} >{profile.submittedCount}</Link></li>
					<li className="x-list-item">正在回答：<Link to={`/profile/responses?submitted=false`} >{profile.answeringCount}</Link></li>
				</ul>
			</div>
		)
	}
}

const mapStateToProps = ({profileViewState})=>{
	return profileViewState;
};

export const Profile = connect(mapStateToProps)(ProfileApp);