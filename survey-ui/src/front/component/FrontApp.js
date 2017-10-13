import React from 'react'
import {Footer} from "./Footer";
import {SurveyList} from "./SurveyList"
import {ResponseList} from "./ResponseList"
import {Profile} from "./Profile"
import {Survey} from "./SurveyList/Survey"
import {SurveyResponse} from "./SurveyList/SurveyResponse"
import {ProfileResponse} from "./ResponseList/ProfileResponse"
import {Route} from 'react-router-dom'
import './FrontApp.css'
import '../../assets/css/common.css'
import '../../assets/css/glyphicons.css'
import '../../assets/css/list.css'
export class FrontApp extends React.Component{
	render(){
		return (
			<div>
				<div className="main">
					<Route path="/surveys" exact={true} component={SurveyList}/>
					<Route path="/surveys/:surveyId" exact={true} component={Survey}/>

					<Route path="/profile" exact={true} component={Profile}/>
					<Route path="/profile/responses" exact={true} component={ResponseList}/>
					<Route path="/profile/responses/:responseId" component={ProfileResponse}/>
					<div className="back" />
				</div>
				<Route path="/surveys/:surveyId/responses" exact={true} component={SurveyResponse}/>
				<Footer location={this.props.location}/>
			</div>
		);
	}
}