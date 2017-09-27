package com.jikezhiji.survey.util;

import com.jikezhiji.survey.domain.embedded.Answer;
import org.junit.Assert;
import org.junit.Test;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by liusizuo on 2017/9/1.
 */
public class SpelsTest {

    @Test
    public void testGetValue(){
        Answer answer = new Answer(new Date());
        Assert.assertTrue(Spels.getValue("value.getTime() > (T(java.lang.System).currentTimeMillis() - 2000)",answer,boolean.class));
        Answer answer1 = new Answer("fuckyou");
        Assert.assertTrue(Spels.getValue("value.contains('fuck')",answer1,boolean.class));
        Assert.assertFalse(Spels.getValue("value.contains('fucking')",answer1,boolean.class));

        Answer answer2 = new Answer(Arrays.asList("male","female","unknown"));
        Assert.assertTrue(Spels.getValue("value.contains('male')",answer2,boolean.class));
        Assert.assertFalse(Spels.getValue("value.contains('人妖')",answer2,boolean.class));

        Map<String,String> geoAnswer = new HashMap<>();
        geoAnswer.put("address","上海市");
        geoAnswer.put("lat","32.5");
        geoAnswer.put("lng","43.3");

        Answer answer3 = new Answer(geoAnswer);
        Assert.assertTrue(Spels.getValue("value['address'] == '上海市'",answer3,boolean.class));
    }
}
