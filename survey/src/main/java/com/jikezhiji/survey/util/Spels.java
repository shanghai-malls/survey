package com.jikezhiji.survey.util;

import com.jikezhiji.survey.domain.embedded.Answer;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.EvaluationException;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

import java.util.*;

/**
 * Created by liusizuo on 2017/9/1.
 */
public class Spels {
    private static final ExpressionParser parser = new SpelExpressionParser();
    private static final EvaluationContext context = new StandardEvaluationContext();

    public static <T> T getValue(String expression,Object rootObject, Class<T> desiredResultType) throws EvaluationException {
        Expression exp = parser.parseExpression(expression);
        return exp.getValue(context,rootObject,desiredResultType);
    }

    public static <T> T getValue(String expression, Class<T> desiredResultType) throws EvaluationException {
        Expression exp = parser.parseExpression(expression);
        return exp.getValue(context,desiredResultType);
    }

}
