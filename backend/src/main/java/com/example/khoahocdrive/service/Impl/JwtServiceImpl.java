package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.exceptions.InvalidDataException;
import com.example.khoahocdrive.service.JwtService;
import com.example.khoahocdrive.supports.enums.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {

    @Value( "${jwt.expiryMinute}")
    private long expiryMinute;
    @Value( "${jwt.accessKey}")
    private String accessKey;
    @Value( "${jwt.refreshKey}")
    private String refreshKey;
    @Value( "${jwt.expiryDay}")
    private long expiryDay;
    @Override
    public String generateAccessToken(long userId, String username, Collection<? extends GrantedAuthority> authorities) {
        Map<String,Object> claims = new HashMap<>();
        String roleName = authorities.iterator().next().getAuthority();
        claims.put("userId", userId);
        claims.put("role",roleName);
        return generateToken(claims,username);
    }

    @Override
    public String generateRefreshToken(long userId, String username, Collection<? extends GrantedAuthority> authorities) {
        Map<String,Object> claims = new HashMap<>();
        String roleName = authorities.iterator().next().getAuthority();
        claims.put("userId", userId);
        claims.put("role",roleName);
        return generateRefreshToken(claims,username);
    }

    @Override
    public String extractUsername(String token, TokenType type) {
        return extractClaims(type,token,Claims::getSubject);
    }

    private <T> T extractClaims(TokenType type, String token, Function<Claims,T> claimsExtractor){
        final  Claims claims = extractAllClaim(token,type);
        return claimsExtractor.apply(claims);
    }
    private Claims extractAllClaim(String token, TokenType type){
        try {
            return Jwts.parser().setSigningKey(accessKey).parseClaimsJws(token).getBody();
        }catch (SignatureException | ExpiredJwtException e){
            throw new AccessDeniedException("Access denied, error: "+e.getMessage());
        }
    }
    private String generateToken(Map<String, Object> claims,String username){
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*expiryMinute))
                .signWith(getKey(TokenType.ACCESS_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims,String username){
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60*24*expiryDay))
                .signWith(getKey(TokenType.ACCESS_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey(TokenType type){
        switch (type){
            case ACCESS_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(accessKey));
            }
            case REFRESH_TOKEN -> {
                return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(refreshKey));
            }
            default -> throw new InvalidDataException("Invalid Token Type");
        }
    }
}
