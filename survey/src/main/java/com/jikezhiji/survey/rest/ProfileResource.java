package com.jikezhiji.survey.rest;

import com.jikezhiji.survey.domain.SurveyResponse;
import com.jikezhiji.survey.persistence.repository.SurveyRepository;
import com.jikezhiji.survey.persistence.repository.SurveyResponseRepository;
import com.jikezhiji.survey.rest.security.AbstractPrincipal;
import com.jikezhiji.survey.rest.security.JwtAuthenticationToken;
import com.jikezhiji.survey.rest.security.SessionIdAuthentication;
import com.jikezhiji.survey.rest.value.Profile;
import com.jikezhiji.survey.rest.value.ProfileSurveyResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.Resources;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

/**
 * Created by liusizuo on 2017/7/12.
 */
@RestController
@RequestMapping("/api")
public class ProfileResource {
    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository responseRepository;

    @Autowired
    public ProfileResource(final SurveyRepository repository,
                           final SurveyResponseRepository responseRepository) {
        this.surveyRepository = repository;
        this.responseRepository = responseRepository;
    }


    private Example<SurveyResponse> example(AbstractPrincipal principal){
        SurveyResponse response = new SurveyResponse();
        response.setUserId(principal.getName());

        ExampleMatcher matcher;
        if (principal instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtPrincipal = (JwtAuthenticationToken) principal;
            response.setServiceId(jwtPrincipal.getServiceId());
            matcher = ExampleMatcher.matching();
        } else if (principal instanceof SessionIdAuthentication) {
            response.setDeviceId(principal.getDeviceId());
            matcher = ExampleMatcher.matching(); // 这里最好改成支持匹配userId和deviceId任意一个就好
        } else {
            throw new AccessDeniedException("未知用户，请先登录");
        }
        return Example.of(response,matcher);
    }


    @GetMapping("/profile")
    public Resource<Profile> getProfile(AbstractPrincipal principal) {
        Example<SurveyResponse> example = example(principal);

        Profile profile = new Profile();

        example.getProbe().setSubmitted(true);
        profile.setSubmittedCount(responseRepository.count(example));//已经提交的答卷

        example.getProbe().setSubmitted(false);
        profile.setAnsweringCount(responseRepository.count(example)); //正在回答的答卷

        profile.setTotalCount(profile.getAnsweringCount() + profile.getSubmittedCount());

        return new Resource<>(profile);
    }

    @GetMapping("/profile/responses/{id}")
    public Resource<SurveyResponse> responses(@PathVariable("id") Long id, AbstractPrincipal principal) {

        Example<SurveyResponse> example = example(principal);
        example.getProbe().setSubmitted(true);
        example.getProbe().setId(id);

        Link link = linkTo(methodOn(ProfileResource.class).responses(id,principal)).withRel("response");
        return new Resource<>(responseRepository.findOne(example),link);
    }

    @GetMapping("/profile/responses")
    public Resources<ProfileSurveyResponse> responses(@RequestParam(value = "submitted",required = false) Boolean submitted,
                                                      Pageable pageable, AbstractPrincipal principal) {

        Example<SurveyResponse> example = example(principal);
        if(submitted == null) {
            example = Example.of(example.getProbe(),example.getMatcher().withIgnorePaths("submitted"));
        } else {
            example.getProbe().setSubmitted(submitted);
        }


        Link link = linkTo(methodOn(ProfileResource.class)
                .responses(submitted,pageable,principal)).withRel("responses");
        return queryProfileSurveyResponsePage(pageable,example,link);
    }


    private Resources<ProfileSurveyResponse>  queryProfileSurveyResponsePage(Pageable pageable,
                                                                             Example<SurveyResponse> example,
                                                                             Link link){
        Page<SurveyResponse> page = responseRepository.findAll(example,pageable);
        List<ProfileSurveyResponse> resources = new ArrayList<>(page.getNumberOfElements());
        for (final SurveyResponse response : page) {
            resources.add(new ProfileSurveyResponse(surveyRepository.findOne(response.getSurveyId()),response));
        }
        PagedResources.PageMetadata metadata = new PagedResources.PageMetadata(
                page.getSize(), page.getNumber(), page.getTotalElements(), page.getTotalPages());

        return new PagedResources<>(resources,metadata, link);
    }
}
