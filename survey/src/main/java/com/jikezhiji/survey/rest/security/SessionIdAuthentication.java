package com.jikezhiji.survey.rest.security;

import org.springframework.security.core.GrantedAuthority;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Collection;

/**
 * Created by liusizuo on 2017/6/19.
 */
public class SessionIdAuthentication extends AbstractPrincipal {
    private Principal principal;
    SessionIdAuthentication(Collection<? extends GrantedAuthority> authorities, HttpServletRequest request) {
        super(authorities,request);
        String userId = request.getHeader("User-Id");
        if(userId == null) {
            throw new IllegalArgumentException("User-Id不能为空");
        }
        this.principal = () -> userId;
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}
