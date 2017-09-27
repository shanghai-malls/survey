package com.jikezhiji.survey.rest.security;

import com.jikezhiji.survey.util.Requests;
import org.springframework.security.core.GrantedAuthority;

import javax.servlet.http.HttpServletRequest;
import java.util.Collection;

/**
 * Created by liusizuo on 2017/9/5.
 */
public abstract class AbstractPrincipal extends org.springframework.security.authentication.AbstractAuthenticationToken {
    private String ipAddr,deviceId;
    public AbstractPrincipal(final Collection<? extends GrantedAuthority> authorities, HttpServletRequest request) {
        super(authorities);
        super.setDetails(request);
        ipAddr = Requests.getIpAddr(request);
        deviceId = request.getHeader("device-id");
    }

    public String getIpAddr(){
        return ipAddr;
    }
    public String getDeviceId(){
        return deviceId;
    }
}
