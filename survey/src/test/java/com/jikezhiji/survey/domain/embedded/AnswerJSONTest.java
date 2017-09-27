package com.jikezhiji.survey.domain.embedded;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jikezhiji.survey.domain.ResponseItem;
import org.junit.Assert;
import org.junit.Test;

import java.io.IOException;

/**
 * Created by liusizuo on 2017/9/1.
 */
public class AnswerJSONTest {
    private ObjectMapper objectMapper = new ObjectMapper();
    @Test
    public void testToJson() throws IOException {

        String text = "{\"responseId\":44,\"questionId\":3,\"value\":\"male\",\"submitTime\":\"2017-08-31 10:28:19.567\",\"interviewTime\":0}";
        ResponseItem item =  objectMapper.readValue(text,ResponseItem.class);
        Assert.assertEquals(text,objectMapper.writeValueAsString(item));

        text = "{\"responseId\":44,\"questionId\":4,\"value\":[\"cheap\"],\"submitTime\":\"2017-08-31 10:28:24.578\",\"interviewTime\":3}";
        item =  objectMapper.readValue(text,ResponseItem.class);
        Assert.assertEquals(text,objectMapper.writeValueAsString(item));

        text = "{\"responseId\":44,\"questionId\":4,\"value\":{\"address\":\"sh\",\"lng\":22,\"lat\":33},\"submitTime\":\"2017-08-31 10:28:24.578\",\"interviewTime\":3}";
        item =  objectMapper.readValue(text,ResponseItem.class);
        Assert.assertEquals(text,objectMapper.writeValueAsString(item));
    }

}
