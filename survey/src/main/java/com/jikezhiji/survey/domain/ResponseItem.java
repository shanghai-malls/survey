package com.jikezhiji.survey.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.jikezhiji.survey.domain.embedded.Answer;
import com.jikezhiji.survey.persistence.converter.AnswerConverter;
import com.syj.support.domain.jpa.entity.JacksonSerializable;
import com.jikezhiji.survey.domain.embedded.ResponseItemId;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "RESPONSE_ITEM")
@IdClass(ResponseItemId.class)
public class ResponseItem implements JacksonSerializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "RESPONSE_ID")
	private Long responseId;

	@Id
	@Column(name = "QUESTION_ID")
	private Long questionId;

	@Column(name = "VALUE",length = 512)
	@JsonUnwrapped
	@Convert(converter = AnswerConverter.class)
	private Answer value;

	@Column(name = "SUBMIT_TIME")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss.SSS")
	private Date submitTime;

	@Column(name = "INTERVIEW_TIME")
	private Long interviewTime;

	public Long getResponseId() {
		return responseId;
	}

	public void setResponseId(Long responseId) {
		this.responseId = responseId;
	}

	public Long getQuestionId() {
		return questionId;
	}

	public void setQuestionId(Long questionId) {
		this.questionId = questionId;
	}

	public Answer getValue() {
		return value;
	}

	public void setValue(final Answer value) {
		this.value = value;
	}

	public Date getSubmitTime() {
		return submitTime;
	}

	public void setSubmitTime(Date submitTime) {
		this.submitTime = submitTime;
	}

	public Long getInterviewTime() {
		return interviewTime;
	}

	public void setInterviewTime(Long interviewTime) {
		this.interviewTime = interviewTime;
	}
}