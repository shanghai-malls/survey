import ReactDOM from "react-dom";
import React from "react";
import {HashRouter, Route} from "react-router-dom";
import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import {FrontApp} from "./front/component/FrontApp";
import {compositeReducers} from "./front/store/composite-reducer";
import registerServiceWorker from "./registerServiceWorker";
import "./front/utils";

let store = createStore(compositeReducers,applyMiddleware(thunk));
ReactDOM.render(
    (<Provider store={store}>
		<HashRouter>
			<div>
				<Route path="/" component={FrontApp}/>
			</div>
		</HashRouter>
	</Provider>),
    document.getElementById('root')
);

registerServiceWorker();