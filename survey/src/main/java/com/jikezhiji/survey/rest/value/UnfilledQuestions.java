package com.jikezhiji.survey.rest.value;

import com.jikezhiji.survey.domain.Question;

import java.util.Arrays;
import java.util.List;

/**
 * Created by liusizuo on 2017/9/6.
 */
public class UnfilledQuestions {
    private boolean hasNext;
    private List<Question> questions;

    public UnfilledQuestions(final boolean hasNext,final List<Question> questions) {
        this.hasNext = hasNext;
        this.questions = questions;
    }

    public UnfilledQuestions(final boolean hasNext, Question ... questions) {
        this.hasNext = hasNext;
        if(questions.length > 0) {
            this.questions = Arrays.asList(questions);
        }
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public boolean isHasNext() {
        return hasNext;
    }
}
