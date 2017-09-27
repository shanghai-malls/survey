package com.jikezhiji.survey.rest.value;

/**
 * Created by liusizuo on 2017/9/5.
 */
public class Profile {

    private long totalCount;
    private long submittedCount;  //已经提交答卷数
    private long answeringCount; //正在回答的答卷数


    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(final long totalCount) {
        this.totalCount = totalCount;
    }


    public long getSubmittedCount() {
        return submittedCount;
    }

    public void setSubmittedCount(final long submittedCount) {
        this.submittedCount = submittedCount;
    }

    public long getAnsweringCount() {
        return answeringCount;
    }

    public void setAnsweringCount(final long answeringCount) {
        this.answeringCount = answeringCount;
    }
}
