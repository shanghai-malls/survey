package com.jikezhiji.survey.rest.oss;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Created by liusizuo on 2017/9/7.
 */
@ConfigurationProperties("aliyun.oss")
public class AliyunOssProperties {
    private String endpoint,bucket,application,accessKeyId,accessKeySecret;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(final String endpoint) {
        this.endpoint = endpoint;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(final String bucket) {
        this.bucket = bucket;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(final String application) {
        this.application = application;
    }

    public String getAccessKeyId() {
        return accessKeyId;
    }

    public void setAccessKeyId(final String accessKeyId) {
        this.accessKeyId = accessKeyId;
    }

    public String getAccessKeySecret() {
        return accessKeySecret;
    }

    public void setAccessKeySecret(final String accessKeySecret) {
        this.accessKeySecret = accessKeySecret;
    }
}
