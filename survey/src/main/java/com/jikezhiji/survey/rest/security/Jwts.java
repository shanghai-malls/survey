package com.jikezhiji.survey.rest.security;

import com.jikezhiji.survey.domain.Service;
import com.jikezhiji.survey.persistence.repository.ServiceRepository;
import com.jikezhiji.survey.util.Systems;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Header;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.JwtParser;

import javax.xml.bind.DatatypeConverter;

/**
 * Created by liusizuo on 2017/6/17.
 */
public class Jwts {



    public static Claims checkToken(String token) {
        String[] parts = token.split("\\.");
        if(parts.length == 3) {
            String content = parts[0] + JwtParser.SEPARATOR_CHAR + parts[1] +  JwtParser.SEPARATOR_CHAR ;
            Jwt<Header, Claims> jwt = io.jsonwebtoken.Jwts.parser().parseClaimsJwt(content);
            if(jwt.getBody().getIssuer() != null) {
                String serviceId = jwt.getBody().getIssuer();
                Service service = Systems.getBean(ServiceRepository.class).findOne(serviceId);
                return io.jsonwebtoken.Jwts.parser().setSigningKey(DatatypeConverter.parseBase64Binary(service.getSecretKey())).parseClaimsJws(token).getBody();
            }
        }
        throw new IllegalArgumentException("无效的jwt:" + token);
    }


}
