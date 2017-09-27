package com.jikezhiji.survey.util;

import org.junit.Test;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * Created by liusizuo on 2017/9/7.
 */
public class StreamTest {

    public static class CallHistory{
        public enum CallType{
            UNKNOWN, // 未知，默认值
            CALLOUT, // 机主是主叫号码
            CALLIN   // 机主是被叫号码
        }

        /**
         * 呼叫时间
         */
        private LocalDateTime callTime;

        /**
         * 呼叫时长（秒）
         */
        private int duration;

        /**
         * 姓名
         */
        private String name;

        /**
         * 电话号码
         */
        private String phone;

        /**
         * 主叫或被叫
         */
        private CallType callType;

        public LocalDateTime getCallTime() {
            return callTime;
        }

        public void setCallTime(final LocalDateTime callTime) {
            this.callTime = callTime;
        }

        public int getDuration() {
            return duration;
        }

        public void setDuration(final int duration) {
            this.duration = duration;
        }

        public String getName() {
            return name;
        }

        public void setName(final String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(final String phone) {
            this.phone = phone;
        }

        public CallType getCallType() {
            return callType;
        }

        public void setCallType(final CallType callType) {
            this.callType = callType;
        }
    }

    @Test
    public void testReduce(){
        List<CallHistory> callHistories = new ArrayList<>();
        HashMap<String,Integer> map = new HashMap<>();
        callHistories.stream().filter(t -> t.getCallTime().until(LocalDateTime.now(), ChronoUnit.DAYS) <= 90L).flatMap(new Function<CallHistory, Stream<?>>() {
            @Override
            public Stream<?> apply(final CallHistory callHistory) {
                return null;
            }
        });
    }
}
