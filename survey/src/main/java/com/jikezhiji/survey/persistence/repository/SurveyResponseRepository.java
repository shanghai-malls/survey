package com.jikezhiji.survey.persistence.repository;

import com.jikezhiji.survey.domain.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by E355 on 2016/11/27.
 */
@RepositoryRestResource(path = "responses",collectionResourceRel = "responses",itemResourceRel="response")
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse,Long> {



}
