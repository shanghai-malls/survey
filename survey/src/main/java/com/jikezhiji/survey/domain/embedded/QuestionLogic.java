package com.jikezhiji.survey.domain.embedded;


import com.jikezhiji.survey.util.Spels;

import java.io.Serializable;

public class QuestionLogic implements Serializable {


    private Long questionId;

    private QuestionAction action;

    private Long targetQuestionId;

    private String expression;

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public QuestionAction getAction() {
        return action;
    }

    public void setAction(QuestionAction action) {
        this.action = action;
    }

    public Long getTargetQuestionId() {
        return targetQuestionId;
    }

    public void setTargetQuestionId(Long targetQuestionId) {
        this.targetQuestionId = targetQuestionId;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(final String expression) {
        this.expression = expression;
    }

    public boolean isMatch(Answer value){
        return Spels.getValue(expression,value,boolean.class);
    }
}
