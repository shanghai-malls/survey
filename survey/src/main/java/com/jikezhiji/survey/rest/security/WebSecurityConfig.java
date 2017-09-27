package com.jikezhiji.survey.rest.security;

import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.*;

import java.util.Arrays;
import java.util.List;

/**
 * Created by liusizuo on 2017/6/19.
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true)
public class WebSecurityConfig {
    private static final List<RequestMatcher> MATCHER_RULE = Arrays.asList(
            new AntPathRequestMatcher("/api/profile/**"),
            new AntPathRequestMatcher("/api/surveys/{id}/responses/**"));

    private static final OrRequestMatcher MATCHER = new OrRequestMatcher(MATCHER_RULE);

    private static final NegatedRequestMatcher NEGATED_MATCHER = new NegatedRequestMatcher(MATCHER);

    @Bean
    public AdminSecurityConfigurer adminSecurity(){
        return new AdminSecurityConfigurer();
    }

    @Bean
    public FrontSecurityConfigurer fontSecurity(){
        return new FrontSecurityConfigurer();
    }


    /**
     * 后台管理部分的安全配置
     */
    @Order(SecurityProperties.BASIC_AUTH_ORDER)
    public static class AdminSecurityConfigurer extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.requestMatcher(new AndRequestMatcher(new AntPathRequestMatcher("api"),NEGATED_MATCHER))
                    .addFilterBefore(new JwtAuthenticationFilter(), BasicAuthenticationFilter.class)
                    .httpBasic()
                    .and().authorizeRequests().anyRequest().hasAnyRole("ADMIN","USER")
            ;
        }

    }

    /**
     * 前端答卷部分的安全配置
     */
    @Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
    public static class FrontSecurityConfigurer extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http.requestMatcher(MATCHER)
                    .addFilterBefore(new JwtAuthenticationFilter(), BasicAuthenticationFilter.class)
                    .addFilterBefore(new SessionIdFilter(),  AnonymousAuthenticationFilter.class).csrf().disable()
            ;
        }

    }


}
