package com.jikezhiji.survey.rest.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.AuthorityUtils;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;

/**
 * Created by liusizuo on 2017/6/17.
 */
public class JwtAuthenticationToken extends AbstractPrincipal {
    private Principal principal;
    private String serviceId;
    JwtAuthenticationToken(Claims claims,HttpServletRequest request) {
        super(AuthorityUtils.createAuthorityList(claims.get("roles",String.class)),request);
        this.serviceId = claims.getIssuer();
        this.principal = claims::getId;
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }

    public String getServiceId(){
        return serviceId;
    }
}
