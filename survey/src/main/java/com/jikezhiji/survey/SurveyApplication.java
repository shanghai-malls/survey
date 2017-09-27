package com.jikezhiji.survey;

import com.jikezhiji.survey.rest.oss.AliyunOssProperties;
import com.jikezhiji.survey.util.Systems;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.event.ContextStartedEvent;


@SpringBootApplication(exclude={org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class})
@EnableDiscoveryClient
@EnableConfigurationProperties(AliyunOssProperties.class)
public class SurveyApplication extends SpringBootServletInitializer {




	public static void main(String[] args) {
		ConfigurableApplicationContext ctx = SpringApplication.run(SurveyApplication.class, args);
		Systems.set(Systems.APPLICATION_CONTEXT,ctx);
		ctx.publishEvent(new ContextStartedEvent(ctx));
		ctx.registerShutdownHook();
	}


}
