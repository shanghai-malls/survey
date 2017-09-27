package com.jikezhiji.survey.domain;

import com.syj.support.domain.jpa.entity.JacksonSerializable;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Created by liusizuo on 2017/6/19.
 */
@javax.persistence.Entity
@Table(name="SERVICE")
public class Service implements JacksonSerializable {

    @Id
    @Column(name="ID",length = 32)
    private String id;

    @Column(name="DESCRIPTION")
    private String description;

    @Column(name="SECRET_KEY")
    private String secretKey;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }
}
