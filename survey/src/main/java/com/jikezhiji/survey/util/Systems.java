package com.jikezhiji.survey.util;

import org.springframework.context.ApplicationContext;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by liusizuo on 2017/6/19.
 */
public class Systems {
    private static Map<String,Object> globalVariables = new ConcurrentHashMap<>();
    public static String APPLICATION_CONTEXT = "applicationContext";

    public static void set(String key,Object value) {
        globalVariables.put(key,value);
    }

    public static <T> T get(String key){
        return (T)globalVariables.get(key);
    }

    public static <T> T getBean(Class<T> type) {
        ApplicationContext ctx = get(APPLICATION_CONTEXT);
        return ctx.getBean(type);
    }
}
