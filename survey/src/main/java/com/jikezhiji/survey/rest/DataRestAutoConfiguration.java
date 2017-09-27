package com.jikezhiji.survey.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.jikezhiji.survey.domain.Question;
import com.jikezhiji.survey.domain.ResponseItem;
import com.jikezhiji.survey.domain.Survey;
import com.jikezhiji.survey.domain.SurveyResponse;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;
import org.springframework.data.rest.core.config.Projection;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurerAdapter;
import org.springframework.data.util.AnnotatedTypeScanner;
import org.springframework.hateoas.config.EnableEntityLinks;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.validation.beanvalidation.CustomValidatorBean;

import javax.validation.Validator;

/**
 * Created by liusizuo on 2017/7/12.
 */
@Configuration
@EnableEntityLinks
@EnableTransactionManagement
@EnableJpaRepositories(repositoryImplementationPostfix="CustomImpl", basePackages="com.jikezhiji.survey")
public class DataRestAutoConfiguration {

    @Bean
    public Validator defaultValidator(){
        return new CustomValidatorBean();
    }

    @Bean
    public ProjectionFactory projectionFactory(){
        return new SpelAwareProxyProjectionFactory();
    }

    @Bean
    public RepositoryRestConfigurer repositoryRestConfigurer(ApplicationContext applicationContext) {

        return new RepositoryRestConfigurerAdapter() {
            @Override
            public void configureJacksonObjectMapper(ObjectMapper objectMapper) {
                objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
            }

            @Override
            public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
                AnnotatedTypeScanner scanner = new AnnotatedTypeScanner(Projection.class);
                scanner.setEnvironment(applicationContext.getEnvironment());
                scanner.setResourceLoader(applicationContext);

                scanner.findTypes("com.jikezhiji.survey.rest.value").forEach(projection->{
                    config.getProjectionConfiguration().addProjection(projection);
                });
                config.exposeIdsFor(SurveyResponse.class, ResponseItem.class, Survey.class, Question.class);
            }
        };
    }
}
