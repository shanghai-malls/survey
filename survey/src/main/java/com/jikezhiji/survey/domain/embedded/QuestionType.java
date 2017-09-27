/*
  * Copyright (c) 2009-2013 上海通路快建网络外包服务有限公司 All rights reserved.
 * @(#) QuestionType.java 2013-05-28 19:58
 */

package com.jikezhiji.survey.domain.embedded;


import com.jikezhiji.survey.domain.Question;
import org.apache.commons.lang.math.NumberUtils;

import java.util.Collection;
import java.util.Map;

/**
 * 表单字段类型。
 *
 * @author E557
 * @version $Id: FieldType.java 81538 2015-05-22 05:35:00Z E557 $
 * @since 1.0
 */
public enum QuestionType  {

	RADIO("单选"),
	CHECKBOX("多选", RADIO),

	SELECT("下拉"),
	MULTIPLE_SELECT("多级下拉", SELECT),

	TEXT_AREA("多行文字"),
	RICH_TEXT_AREA("富文本",TEXT_AREA),

	TEXT_INPUT("单行文字"),
	
	NUMBER_INPUT("数字", TEXT_INPUT),
	EMAIL_INPUT("邮箱", TEXT_INPUT),
	URL_INPUT("网址", TEXT_INPUT),
	TELEPHONE_INPUT("电话", TEXT_INPUT),
	CELLPHONE_INPUT("手机", TEXT_INPUT),
	DATETIME_INPUT("日期/时间", TEXT_INPUT),

	RANKING("评分"),
	
	SECTION("分段"),

	TEXT_DISPLAY("文本显示"),
	IMAGE_DISPLAY("图片显示",TEXT_DISPLAY),
	AUDIO_DISPLAY("视频播放",TEXT_DISPLAY),
	VIDEO_DISPLAY("视频播放",TEXT_DISPLAY),

	FILE_UPLOAD("文件上传"),
	IMAGE_UPLOAD("图片上传",FILE_UPLOAD),
	AUDIO_UPLOAD("音频上传",FILE_UPLOAD),
	
	ARRAY("矩阵"),
	ARRAY_NUMBERS("矩阵数字",ARRAY),
	ARRAY_TEXTS("矩阵文本",ARRAY),
	ARRAY_RADIO("矩阵单选",ARRAY),
	
	GEO("地理位置"),
	WEB("WEB页面"),
	ADDRESS("地址"),
	WEIBO_SHARE("微博转发"),
	WECHAT_SHARE("微信转发");

	final String name;
	final QuestionType parent;



	QuestionType( String name) {
		this(name, null);
	}

	QuestionType(String name, QuestionType parent) {
		this.name = name;
		this.parent = parent;
	}

	public String getName() {
		return name;
	}


	public boolean isAssignableFrom(QuestionType other) {
		for (QuestionType p = other; p != null; p = p.parent) {
			if (p.equals(this)) {
				return true;
			}
		}
		return false;
	}


	public static boolean validate(Question question,Answer answer){
		if(question.getType() == CHECKBOX || question.getType() == MULTIPLE_SELECT){
			return answer.getValue() instanceof Collection;
		}

		if(question.getType() == GEO){
			return answer.getValue() instanceof Map;
		}
		if(question.getType().parent == TEXT_INPUT){
			if(answer.getValue() instanceof String){
				String value = (String) answer.getValue();
				switch (question.getType()) {
					case NUMBER_INPUT:
						return NumberUtils.isNumber(value);
					case EMAIL_INPUT:
						return value.matches("^[\\w_.]{3,50}@\\w{1,50}\\.[a-z]{1,10}$");
					case CELLPHONE_INPUT:
						return value.matches("^1[0-9]{10}$");
					case TELEPHONE_INPUT:
						return value.matches("^0[0-9]{2,3}-[0-9]{7,8}$");
					case URL_INPUT:
						return value.matches("^https?://\\w+\\.[a-z]{1,50}\\S*$");
					default:
						return true;
				}
			}
			return false;
		}
		return true;
	}
	
}
