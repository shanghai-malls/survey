package com.jikezhiji.survey.domain.persistence.converter;

import com.jikezhiji.survey.domain.embedded.Answer;
import com.jikezhiji.survey.persistence.converter.AnswerConverter;
import org.junit.Assert;
import org.junit.Test;

import java.util.Map;

public class AnswerConverterTest {
    AnswerConverter converter = new AnswerConverter();


    @Test
    public void convertToEntityAttributeTest(){
        Answer answer = converter.convertToEntityAttribute("{\"code\":\"false\",\"text\":\"非常的不原意\"}");
        Assert.assertTrue(answer.getValue() instanceof Map);
    }
}
