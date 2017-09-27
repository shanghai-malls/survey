package com.jikezhiji.survey.rest;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.util.AntPathMatcher;

import java.util.Map;

/**
 * Created by liusizuo on 2017/9/5.
 */
public class SpringAntMatcherTest {

    private static interface Matcher {
        boolean matches(String path);

        Map<String, String> extractUriTemplateVariables(String path);
    }

    private static class SpringAntMatcher implements Matcher {
        private final AntPathMatcher antMatcher;

        private final String pattern;

        private SpringAntMatcher(String pattern, boolean caseSensitive) {
            this.pattern = pattern;
            this.antMatcher = createMatcher(caseSensitive);
        }

        @Override
        public boolean matches(String path) {
            return this.antMatcher.match(this.pattern, path);
        }

        @Override
        public Map<String, String> extractUriTemplateVariables(String path) {
            return this.antMatcher.extractUriTemplateVariables(this.pattern, path);
        }

        private static AntPathMatcher createMatcher(boolean caseSensitive) {
            AntPathMatcher matcher = new AntPathMatcher();
            matcher.setTrimTokens(true);
            matcher.setCaseSensitive(caseSensitive);
            return matcher;
        }
    }


    @Test
    public void testMatcher(){
        SpringAntMatcher matcher = new SpringAntMatcher("/api/surveys/{id}/responses/**",true);
        Assert.assertTrue(matcher.matches("/api/surveys/1/responses/1/items"));
    }

}
