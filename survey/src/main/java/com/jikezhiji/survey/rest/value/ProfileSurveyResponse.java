package com.jikezhiji.survey.rest.value;

import com.jikezhiji.survey.domain.Survey;
import com.jikezhiji.survey.domain.SurveyResponse;

/**
 * Created by liusizuo on 2017/8/28.
 */
public class ProfileSurveyResponse {
    private final Survey survey;
    private final SurveyResponse response;
    public Survey getSurvey(){
        return survey;
    }

    public SurveyResponse getResponse(){
        return response;
    }

    public ProfileSurveyResponse(final Survey survey, final SurveyResponse surveyResponse) {
        this.survey = survey;
        this.response = surveyResponse;
    }
}
