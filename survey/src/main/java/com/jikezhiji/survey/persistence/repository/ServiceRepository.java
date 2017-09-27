package com.jikezhiji.survey.persistence.repository;

import com.jikezhiji.survey.domain.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Created by liusizuo on 2017/6/19.
 */
@RepositoryRestResource
@PreAuthorize("hasRole('ADMIN')")
public interface ServiceRepository extends JpaRepository<Service,String>{
}
