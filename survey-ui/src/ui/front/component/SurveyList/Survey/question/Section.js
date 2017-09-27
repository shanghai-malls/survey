import React from 'react'


export class Section extends React.Component{
    render(){
        let desc = this.props.question.content || '分割线';
        return (
            <div className="section">
                <p><em>{desc}</em></p>
            </div>
        )
    }
}