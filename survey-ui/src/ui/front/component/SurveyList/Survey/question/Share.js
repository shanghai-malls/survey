/**
 * Created by liusizuo on 2017/7/24.
 */
import Question from './Question'
import React from 'react'

export class Share extends Question {


    body() {
        let shareType = this.props.question.type;
        if(shareType === 'WECHAT_SHARE') {
            shareType = '微信';
        } else if(shareType === 'WEIBO_SHARE'){
            shareType = '微博';
        }
        return (
            <div className="question-body share">
                <button type="button" className="btn btn-default" disabled={this.props.readOnly}><em className="glyphicon glyphicon-share" /><span>&nbsp;&nbsp;分享到{shareType}&nbsp;</span></button>
            </div>
        )
    }
}