package com.jikezhiji.survey.domain.embedded;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * Created by liusizuo on 2017/9/1.
 */
public class Answer {
    private Object value;

    @JsonCreator
    public Answer(@JsonProperty("value")Object value) {
        this.value = value;
    }

    public Object getValue() {
        return value;
    }


}
