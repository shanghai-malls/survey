/**
 * Created by liusizuo on 2017/7/18.
 */
import React from 'react';
import Question from './Question'
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css'

class Ranking extends Question {


    onChange(v){
        super.fillInResponse(v);
    };
    body(){
        return (
            <div className="question-body ranking" >
                <Rate
                    disabled={this.props.readOnly}
                    defaultValue={this.state.value}
                    onChange={this.onChange.bind(this)}
                    style={{ fontSize: 50}}
                    allowHalf
                    character={<em className="anticon anticon-star" />}
                />
            </div>

        );
    }
}

export {Ranking}