package com.jikezhiji.survey.rest.security;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Enumeration;
import java.util.List;

/**
 * Created by liusizuo on 2017/6/19.
 */
public class SessionIdFilter extends GenericFilterBean implements  InitializingBean {

    private List<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList("ROLE_VISITOR");



    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            SecurityContextHolder.getContext().setAuthentication(createAuthentication((HttpServletRequest) req));

            if (logger.isDebugEnabled()) {
                logger.debug("Populated SecurityContextHolder with anonymous token: '" + SecurityContextHolder.getContext().getAuthentication() + "'");
            }
        } else {
            if (logger.isDebugEnabled()) {
                logger.debug("SecurityContextHolder not populated with anonymous token, as it already contained: '" + SecurityContextHolder.getContext().getAuthentication() + "'");
            }
        }

        chain.doFilter(req, res);
    }

    private Authentication createAuthentication(HttpServletRequest request) {
        return new SessionIdAuthentication(authorities,request);
    }

}