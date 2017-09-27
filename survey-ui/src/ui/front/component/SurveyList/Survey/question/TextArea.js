import Question from './Question'
import React from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export class TextArea extends Question {
    constructor(props) {
        super(props);
        this.state.className='text-area';
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(eventOrValue) {
        let {type} = this.props.question;
        if(type === 'TEXT_AREA') {
            super.fillInResponse(eventOrValue.target.value)
        } else if(type === 'RICH_TEXT_AREA') {
            super.fillInResponse(eventOrValue)
        }
    }

    body() {
        let {type,mandatory} = this.props.question;
        let content;
        if(type === 'TEXT_AREA') {
            content = <textarea readOnly={this.props.readOnly} className="form-control" onChange={this.handleChange} required={mandatory} defaultValue={this.state.value} />;
        } else if(type === 'RICH_TEXT_AREA') {
            content = (
                <ReactQuill className="rq-container" readOnly={this.props.readOnly} onChange={this.handleChange} defaultValue={this.state.value} >
                    <div className="rq-editor"/>
                </ReactQuill>
            )
        }
        return (
            <div className="question-body textarea">
                {content}
            </div>
        );
    }
}