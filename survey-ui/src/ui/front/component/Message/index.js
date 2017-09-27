import React from 'react';
import ReactDOM from "react-dom";
import './index.css'

export class Message{
    static error(error) {
        if(error && error.message) {
            let div = document.getElementById('global-message-container');
            if(! div) {
                div = document.createElement('div');
                div.id = 'global-message-container';
                document.body.appendChild(div);
            }

            ReactDOM.render(
                <div className="alert alert-danger" role="alert"><strong>错误!</strong> {error.message}</div>, div
            );
            setTimeout(()=>{
                div.innerHTML="";
            },2500)
        }
    }
}
