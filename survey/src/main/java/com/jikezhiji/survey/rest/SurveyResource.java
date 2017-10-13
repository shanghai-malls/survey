package com.jikezhiji.survey.rest;

import com.google.common.base.Objects;
import com.jikezhiji.survey.domain.*;
import com.jikezhiji.survey.domain.embedded.AccessRule;
import com.jikezhiji.survey.domain.embedded.Answer;
import com.jikezhiji.survey.domain.embedded.QuestionType;
import com.jikezhiji.survey.domain.embedded.SurveyFormat;
import com.jikezhiji.survey.persistence.repository.QuotaRepository;
import com.jikezhiji.survey.persistence.repository.SurveyAccessTokenRepository;
import com.jikezhiji.survey.persistence.repository.SurveyRepository;
import com.jikezhiji.survey.persistence.repository.SurveyResponseRepository;
import com.jikezhiji.survey.rest.security.AbstractPrincipal;
import com.jikezhiji.survey.rest.security.JwtAuthenticationToken;
import com.jikezhiji.survey.rest.value.UnfilledQuestions;
import com.jikezhiji.survey.util.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Created by E355 on 2017/1/1.
 */
@RestController
@RequestMapping(path = "/api",produces = "application/json; charset=UTF-8")
public class SurveyResource {

    private SurveyRepository repository;
    private SurveyResponseRepository responseRepository;
    private QuotaRepository quotaRepository;
    private ProjectionFactory projectionFactory;
    private SurveyAccessTokenRepository tokenRepository;

    @Autowired
    public SurveyResource(SurveyRepository repository,SurveyResponseRepository responseRepository,
                          QuotaRepository quotaRepository,ProjectionFactory projectionFactory,
                          SurveyAccessTokenRepository tokenRepository) {
        this.repository = repository;
        this.responseRepository = responseRepository;
        this.quotaRepository = quotaRepository;
        this.projectionFactory = projectionFactory;
        this.tokenRepository = tokenRepository;
    }



    /**
     * 新建一份答卷
     * @param surveyId
     * @return
     */
    @PostMapping(value = "/surveys/{surveyId}/responses")
    public Resource<SurveyResponse> addResponse(@PathVariable("surveyId")Long surveyId, AbstractPrincipal principal,HttpServletRequest request) {
        Survey survey = validateSurvey(repository.findOne(surveyId));
        SurveySetting setting = survey.getSetting();
        long responseCount = responseRepository.count(Example.of(new SurveyResponse(surveyId,true)));
        if(setting.getResponseLimit() <= responseCount) {
            throw new IllegalStateException("问卷的参与份数已经足够");
        }

        SurveyResponse newResponse = new SurveyResponse();
        newResponse.setUserId(principal.getName());
        newResponse.setSubmitted(false);
        newResponse.setSurveyId(surveyId);
        newResponse.setServiceId(survey.getServiceId());
        newResponse.setStartTime(new Date());
        newResponse.setDeviceId(principal.getDeviceId());
        newResponse.setIpAddress(principal.getIpAddr());

        if(setting.getAccessRule() == AccessRule.ONCE_PER_USER) {
            if(principal instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken token = (JwtAuthenticationToken) principal;
                if(!token.getServiceId().equals(survey.getServiceId())) {
                    throw new AccessDeniedException("你没有权限回答当前问卷，请更换账号");
                }
                SurveyResponse response = new SurveyResponse(surveyId);
                response.setUserId(principal.getName());
                SurveyResponse unsubmittedResponse = responseRepository.findOne(Example.of(response));
                if(unsubmittedResponse != null ) {
                    if(unsubmittedResponse.isSubmitted()) {
                        throw new AccessDeniedException("当前问卷每个用户限填一次");
                    } else {
                        newResponse = unsubmittedResponse;
                    }
                }
            } else {
                throw new AccessDeniedException("当前问卷只允许特定用户回答，请先登录");
            }
        } else if(setting.getAccessRule() == AccessRule.ONCE_PER_IP) {
            SurveyResponse response = new SurveyResponse(surveyId);
            response.setIpAddress(newResponse.getIpAddress());
            SurveyResponse unsubmittedResponse = responseRepository.findOne(Example.of(response));
            if(unsubmittedResponse != null ) {
                if(unsubmittedResponse.isSubmitted()) {
                    throw new AccessDeniedException("当前问卷每个IP限填一次");
                } else {
                    newResponse = unsubmittedResponse;
                }
            }
        } else if(setting.getAccessRule() == AccessRule.ONCE_PER_DEVICE) {
            SurveyResponse response = new SurveyResponse(surveyId);
            response.setDeviceId(newResponse.getDeviceId());
            SurveyResponse unsubmittedResponse = responseRepository.findOne(Example.of(response));
            if(unsubmittedResponse != null ) {
                if(unsubmittedResponse.isSubmitted()) {
                    throw new AccessDeniedException("当前问卷每个IP限填一次");
                } else {
                    newResponse = unsubmittedResponse;
                }
            }
        } else if(setting.getAccessRule() == AccessRule.TOKEN){
            String tokenId = request.getParameter("token");
            if(tokenId == null) {
                throw new AccessDeniedException("token不能为空");
            }
            SurveyAccessToken token = tokenRepository.findOne(tokenId);
            if(token == null || !token.getSurveyId().equals(surveyId)) {
                throw new AccessDeniedException("您使用的token无效");
            }

            SurveyResponse response = new SurveyResponse(surveyId);
            response.setSubmitted(false);
            response.setAccessToken(token.getTokenId());
            response.setUserId(principal.getName());

            SurveyResponse unsubmittedResponse = responseRepository.findOne(Example.of(response));
            if(unsubmittedResponse != null) {
                newResponse = unsubmittedResponse;
            } else {
                if(!token.isEffective()) {
                    throw new AccessDeniedException("您使用的token无效");
                }
                newResponse.setAccessToken(token.getTokenId());
            }

        } else {
            SurveyResponse response = new SurveyResponse(surveyId);
            response.setSubmitted(false);
            response.setUserId(principal.getName());

            SurveyResponse unsubmittedResponse = responseRepository.findOne(Example.of(response));
            if(unsubmittedResponse != null) {
                newResponse = unsubmittedResponse;
            }
        }
        responseRepository.save(newResponse);
        return new Resource<>(newResponse);
    }


    /**
     * 获取某份答卷当前待回答的那一批问题
     * @return
     */
    @GetMapping(value = "/surveys/{surveyId}/responses/{responseId}/questions")
    public Resource<UnfilledQuestions> getResponseCurrentUnfilledQuestions(@PathVariable("surveyId")Long surveyId,
                                                                           @PathVariable("responseId")Long responseId,
                                                                           Principal principal){
        SurveyResponse response = validateResponse(surveyId,responseId,principal);

        /**
         * 这里本来三行可以简化为一行的，但是写在一起的话在意图表达方面又不够直观。
         */
        Survey survey = repository.findOne(surveyId);
        SurveySetting setting = survey.getSetting();
        List<Question> questions = survey.getQuestions();

        switch (setting.getFormat()) {
            case QUESTION_BY_QUESTION:
                Question lastQuestion = survey.getQuestion(response.getLastQuestionId());//最后回答的问题
                if(lastQuestion == null) {
                    lastQuestion = survey.firstQuestion();
                }
                ResponseItem lastItem = response.lastItem();
                Question nextQuestion = lastQuestion.toNext(lastItem.getValue()); //通过问卷的跳转逻辑计算出下一个需要回答的问题

                if(nextQuestion == Question.TERMINAL_QUESTION) {
                    response.setTerminationTime(lastItem.getSubmitTime());
                    responseRepository.save(response);
                }
                boolean hasNext = true;
                if(nextQuestion == null || nextQuestion == Question.TERMINAL_QUESTION || nextQuestion == questions.get(questions.size() - 1)) {
                    hasNext = false;
                }
                return new Resource<>(new UnfilledQuestions(hasNext,nextQuestion));
            case GROUP_BY_GROUP:
                List<Question> groupQuestions = getGroupQuestions(questions,response.getLastQuestionId());
                hasNext = groupQuestions.get(groupQuestions.size() - 1) != questions.get(groupQuestions.size() - 1);
                return new Resource<>(new UnfilledQuestions(hasNext,groupQuestions));
            case ALL_IN_ONE:
                return new Resource<>(new UnfilledQuestions(false,questions));
            default:
                throw new UnsupportedOperationException("不支持的类型");
        }

    }



    /**
     * 添加一个答案
     * @param surveyId 问卷id
     * @param responseId 答卷id
     * @param item 答案
     * @param principal 用户的身份
     * @return
     */
    @PostMapping(value = "/surveys/{surveyId}/responses/{responseId}/items/{questionId}")
    public Resource<UnfilledQuestions> addResponseItem(@PathVariable("surveyId")Long surveyId, @PathVariable("responseId")Long responseId,@RequestBody ResponseItem item, Principal principal) {

        SurveyResponse surveyResponse = validateResponse(surveyId,responseId,principal);
        Survey survey = validateSurvey(repository.findOne(surveyId));
        checkAndPutItemInResponse(survey,surveyResponse,item);

        List<Quota> quotas = quotaRepository.findAll(Example.of(new Quota(surveyId)));
        List<SurveyResponse> responses = responseRepository.findAll(Example.of(new SurveyResponse(surveyId)));

        checkQuotas(quotas, responses);


        responseRepository.save(surveyResponse);
        return getResponseCurrentUnfilledQuestions(surveyId,responseId,principal);
    }

    /**
     * 批量添加答案
     * @param surveyId 问卷ID
     * @param responseId 答卷ID
     * @param items 问题和答案
     * @param principal 用户标识
     * @return
     */
    @PostMapping(value = "/surveys/{surveyId}/responses/{responseId}/items")
    public Resource<UnfilledQuestions> addResponseItems(@PathVariable("surveyId")Long surveyId,
                                             @PathVariable("responseId")Long responseId,
                                             @RequestBody List<ResponseItem> items,
                                              Principal principal) {
        SurveyResponse surveyResponse = validateResponse(surveyId,responseId,principal);
        Survey survey = validateSurvey(repository.findOne(surveyId));
        items.forEach(item-> checkAndPutItemInResponse(survey, surveyResponse,  item));
        List<Quota> quotas = quotaRepository.findAll(Example.of(new Quota(surveyId)));
        List<SurveyResponse> responses = responseRepository.findAll(Example.of(new SurveyResponse(surveyId)));

        checkQuotas(quotas, responses);//实时检查配额
        responseRepository.save(surveyResponse);
        return getResponseCurrentUnfilledQuestions(surveyId,responseId,principal);
    }

    private void checkAndPutItemInResponse(Survey survey,SurveyResponse response,  ResponseItem responseItem) {
        Question question = survey.getQuestion(responseItem.getQuestionId());
        if(question == null) {
            throw new ResourceNotFoundException("问卷的问题不存在");
        }
        question.validateAnswer(responseItem.getValue());//验证答案本身

        responseItem.setResponseId(response.getId());
        if(responseItem.getSubmitTime() == null) {
            responseItem.setSubmitTime(new Date());
        }

        ResponseItem item = response.getItem(question.getId());
        if(item != null) {
            //如果之前已经填写过这个问题的答案，验证重新编辑答案逻辑
            validateReeditAnswer(response,survey,question.getId());

            item.setValue(responseItem.getValue());
            item.setInterviewTime(responseItem.getInterviewTime());
            item.setSubmitTime(responseItem.getSubmitTime());
            item.setQuestionId(question.getId());
            item.setResponseId(response.getId());
        } else{
            response.addItems(responseItem);
        }
    }


    private void checkQuotas(List<Quota> quotas, List<SurveyResponse> responses) {
        for (Quota quota : quotas) {
            checkQuota(quota,responses);
        }
    }

    /**
     * 每一份配额都有数额限定，检查这份配额的是否收集满了，如果满了则通过抛出异常丢弃掉这份答卷。
     */
    private void checkQuota(Quota quota,List<SurveyResponse> responses){
        int count = 0;
        for (SurveyResponse response : responses) {
            if(isMatches(quota,response)){
                count++;
            }
        }
        if(quota.getQuantity() <= count){
            throw new IllegalStateException(quota.getMessage());
        }
    }

    /**
     * 判断配额和答卷是否匹配
     * @param quota 配额
     * @param response 答卷
     */
    private boolean isMatches(Quota quota,SurveyResponse response){
        for (MemberQuota memberQuota : quota.getMembers()) {
            for (ResponseItem item : response.getItems()) {
                Answer answer = item.getValue();
                if(item.getQuestionId().equals(memberQuota.getQuestionId())
                        && answer.getValue().equals(memberQuota.getCode())){
                    return true;
                }
            }
        }
        return false;
    }



    /**
     * 提交答卷
     * @param surveyId 问卷id
     * @param responseId 答卷id
     * @param principal 身份信息
     * @return
     */
    @PutMapping(value = "/surveys/{surveyId}/responses/{responseId}")
    public ResponseEntity<?> submitResponse(@PathVariable("surveyId")Long surveyId,
                                           @PathVariable("responseId")Long responseId,
                                           Principal principal) {
        SurveyResponse response = validateResponse(surveyId,responseId,principal);

        Survey survey = validateSurvey(repository.findOne(surveyId));
        //检查必答问题
        validateRequiredQuestions(survey,response);

        response.setSubmitted(true);
        response.setSubmitTime(new Date());
        response.setInterviewTime((response.getSubmitTime().getTime() - response.getStartTime().getTime()) / 1000);
        responseRepository.save(response);

        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/surveys/{surveyId}/responses/{responseId}")
    public ResponseEntity<?> submitResponseAndItems(@PathVariable("surveyId")Long surveyId,
                                            @PathVariable("responseId")Long responseId,
                                            @RequestBody List<ResponseItem> items,
                                            Principal principal) {
        SurveyResponse response = validateResponse(surveyId,responseId,principal);
        Survey survey = validateSurvey(repository.findOne(surveyId));
        //检查答案是否合法
        items.forEach(item-> checkAndPutItemInResponse(survey, response,  item));
        List<Quota> quotas = quotaRepository.findAll(Example.of(new Quota(surveyId)));
        List<SurveyResponse> responses = responseRepository.findAll(Example.of(new SurveyResponse(surveyId)));

        checkQuotas(quotas, responses);//实时检查配额

        //检查必答问题
        validateRequiredQuestions(survey,response);
        response.setSubmitted(true);
        response.setSubmitTime(new Date());
        response.setInterviewTime((response.getSubmitTime().getTime() - response.getStartTime().getTime()) / 1000);
        responseRepository.save(response);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/surveys/{surveyId}/responses/{responseId}")
    public Resource<SurveyResponse> getResponse(@PathVariable("surveyId")Long surveyId,@PathVariable("responseId")Long responseId,Principal principal){
        return new Resource<>(validateResponse(surveyId,responseId,principal));
    }


    /**
     * 查询答卷信息
     * @param surveyId
     * @return
     */
    @GetMapping(value = "/surveys/{surveyId}/responses")
    public Resources<SurveyResponse> queryResponses(@PathVariable("surveyId")Long surveyId,
                                                   AbstractPrincipal principal) {
        Survey survey = repository.findOne(surveyId);
        if(survey.getSetting().getAccessRule() == AccessRule.ONCE_PER_USER) {
            if(principal instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtp = (JwtAuthenticationToken) principal;
                if(!jwtp.getServiceId().equals(survey.getServiceId())) {
                    throw new AccessDeniedException("你没有权限回答当前问卷，请更换账号");
                }
            } else {
                throw new AccessDeniedException("你没有权限回答当前问卷，请更换账号");
            }
        }
        List<SurveyResponse> responses = responseRepository.findAll(
                Example.of(new SurveyResponse(surveyId,true)), new Sort(Sort.Direction.ASC,"startTime"));
        return new Resources<>(responses);
    }

    private Survey validateSurvey(Survey survey){
        //1.验证状态和是否处于可以回答的时间区间
        if(!survey.isActive()) {
            throw new IllegalStateException("问卷还未激活");
        }
        if(survey.getStartTime().getTime() > System.currentTimeMillis() // 开始时间大于当前时间 说明问卷还没有开始
                || System.currentTimeMillis() > survey.getExpiryTime().getTime()) { //当前时间大于过期时间 说明问卷已经过期
            throw new IllegalStateException("问卷不在可回答的时间区间内");
        }
        return survey;
    }

    private SurveyResponse validateResponse(Long surveyId,Long responseId,Principal principal){
        SurveyResponse response = responseRepository.findOne(responseId);
        if(response == null) {
            throw new ResourceNotFoundException("答卷不存在");
        }
        if(! response.getSurveyId().equals(surveyId)) {
            throw new ResourceNotFoundException("答卷不存在");
        }
        if(! response.getUserId().equals(principal.getName())) {
            throw new AccessDeniedException("你不能访问别人的答卷");
        }

        return response;
    }

    private void validateRequiredQuestions(Survey survey,SurveyResponse response){
        survey.getQuestions().stream().filter(Question::isMandatory).forEach(q->{
            ResponseItem item = response.getItem(q.getId());
            if(item == null || item.getValue() == null){
                if(q.getDefaultAnswer()!=null) {
                    if(item == null) {
                        item = new ResponseItem();
                        item.setResponseId(response.getId());
                        item.setInterviewTime(0L);
                        item.setSubmitTime(new Date());
                        item.setQuestionId(q.getId());
                    }
                    item.setValue(q.getDefaultAnswer());
                    response.addItems(item);
                } else {
                    throw new IllegalStateException("必答问题没有回答");
                }
            }
        });
    }

    private void validateReeditAnswer(SurveyResponse sr, Survey survey, Long questionId) {
        if(sr.isSubmitted() ) {
            if(!survey.getSetting().isAllowEditAfterCompletion()) {
                throw new IllegalStateException("禁止修改已经完成了答卷的答案！");
            }
        } else if(! survey.getSetting().isAllowPrev() ){
            if (survey.getSetting().getFormat() == SurveyFormat.QUESTION_BY_QUESTION ||
                    //如果当前提交的问题和最后答题的问题不属于同一组问题
                    survey.getSetting().getFormat() == SurveyFormat.GROUP_BY_GROUP &&
                            getGroupQuestions(survey.getQuestions(),sr.getLastQuestionId()).stream().noneMatch(q->q.getId().equals(questionId)))
                throw new IllegalStateException("禁止回到上一步修改已经提交的答案");
        }
    }

    static List<Question> getGroupQuestions(List<Question> questions,Long questionId){
        int index = questions.indexOf(new Question(questionId));
        if(index == questions.size() - 1) {
            return Collections.singletonList(questions.get(index));
        }

        List<Question>[] parts = Lists.split(questions,index);
        List<Question> part1 = parts[0];
        List<Question> part2 = parts[1];
        int start = 0;
        int end = questions.size();
        for (int i = part1.size()-1; i >=0; i--) {
            if(part1.get(i).getType() == QuestionType.SECTION) {
                start = i + 1;
                break;
            }
        }

        for (int i = 0; i < part2.size(); i++) {
            if(part2.get(i).getType() == QuestionType.SECTION) {
                end = part1.size() + i + 1;
                break;
            }
        }
        if(start == 0 && end == questions.size()) {
            return questions;
        } else {
            return questions.subList(start,end);
        }
    }
}
