package com.jikezhiji.survey.persistence.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.jikezhiji.survey.domain.embedded.Answer;
import com.syj.support.domain.jpa.converter.JSONConverter;

import java.util.Collection;
import java.util.Map;

/**
 * Created by liusizuo on 2017/8/31.
 */
public class AnswerConverter extends JSONConverter<Answer> {
    private TypeReference<Collection<?>> stringCollectionTypeReference =  new TypeReference<Collection<?>>(){};
    private TypeReference<Map<String,String>> stringMapTypeReference =  new TypeReference<Map<String,String>>(){};

    @Override
    public String convertToDatabaseColumn(Answer answer) {
        if(answer != null) {
            if(answer.getValue() instanceof String) {
                return answer.getValue().toString();
            }
            return super.writeValueAsString(answer.getValue());
        }
        return null;
    }

    @Override
    public Answer convertToEntityAttribute(String dbData) {
        try{
            if(dbData != null) {
                char c = dbData.charAt(0);
                switch (c){
                    case '[':
                        return new Answer(mapper.readValue(dbData,stringCollectionTypeReference));
                    case '{':
                        return new Answer(mapper.readValue(dbData,stringMapTypeReference));
                    default:
                        return new Answer(dbData);
                }
            }
            return null;
        } catch (Exception e) {
            throw  new IllegalStateException("无法解析JSON字符串:" + dbData);
        }
    }
}
