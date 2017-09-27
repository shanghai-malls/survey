import React from "react";
import {NavLink} from "react-router-dom";
import "./index.css";
export class Footer extends React.Component{

	render(){
		let pathname = this.props.location.pathname;
		pathname = pathname.endsWith("/") ? pathname.substr(0,pathname.length - 1) : pathname;
		if(["/surveys","/profile/responses","/profile"].indexOf(pathname) !==-1){
            return (
				<section className="footer-nav">
					<nav>
						<NavLink to="/surveys" activeClassName="active">
							<span className="glyphicon glyphicon-th-list"/>
							<div>问卷列表</div>
						</NavLink>
					</nav>
					<nav>
						<NavLink to="/profile/responses" activeClassName="active">
							<span className="glyphicon glyphicon-pencil"/>
							<div>已参与</div>
						</NavLink>
					</nav>
					<nav>
						<NavLink to="/profile" exact={true} activeClassName="active">
							<span className="glyphicon glyphicon-home"/>
							<div>个人中心</div>
						</NavLink>
					</nav>
				</section>
            )
		} else {
            return <span />
		}

	}
}

