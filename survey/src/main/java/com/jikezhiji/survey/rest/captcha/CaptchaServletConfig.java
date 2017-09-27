package com.jikezhiji.survey.rest.captcha;

import com.google.code.kaptcha.Constants;
import com.google.code.kaptcha.servlet.KaptchaServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Created by liusizuo on 2017/8/22.
 */
@Configuration
public class CaptchaServletConfig {

    private static final String DEFAULT_CAPTCHA_SERVLET_BEAN_NAME = "CaptchaServlet";

    private KaptchaServlet proxy = new KaptchaServlet();

    @Bean
    public ServletRegistrationBean captchaServletRegistration() {
        ServletRegistrationBean registration = new ServletRegistrationBean(proxy, "/captcha/*");
        registration.setName(DEFAULT_CAPTCHA_SERVLET_BEAN_NAME);
        registration.addInitParameter(Constants.KAPTCHA_BORDER,"no");
        registration.addInitParameter(Constants.KAPTCHA_IMAGE_WIDTH,"106");
        registration.addInitParameter(Constants.KAPTCHA_IMAGE_HEIGHT,"46");
        registration.addInitParameter(Constants.KAPTCHA_TEXTPRODUCER_CHAR_LENGTH,"4");
        return registration;
    }
}
