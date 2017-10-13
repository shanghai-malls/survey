/**
 * Created by liusizuo on 2017/7/24.
 */
import Question from './Question'
import React from 'react'

export class Display extends Question {

    body() {
        let innerHTML;
        if(this.props.question.type === 'TEXT_DISPLAY') {
            innerHTML = <p>{this.props.question.content}</p>
        } else if(this.props.question.type === 'IMAGE_DISPLAY'){
            innerHTML = <img src={this.props.question.content} alt="图片展示题" />
        } else if(this.props.question.type === 'VIDEO_DISPLAY'){
            innerHTML = <video controls src={this.props.question.content} onEnded={this.displayEnded.bind(this)}/>
        } else if(this.props.question.type === 'AUDIO_DISPLAY'){
            innerHTML = <audio controls src={this.props.question.content} onEnded={this.displayEnded.bind(this)} />
        }
        return (
            <div className="question-body display" >{innerHTML}</div>
        )
    }
    componentDidMount(){
        if(this.props.question.type === 'TEXT_DISPLAY') {
            this.displayEnded();
        } else if(this.props.question.type === 'IMAGE_DISPLAY'){
            this.displayEnded();
        }
    }

    displayEnded(){
        super.fillInResponse('displayed')
    }
}