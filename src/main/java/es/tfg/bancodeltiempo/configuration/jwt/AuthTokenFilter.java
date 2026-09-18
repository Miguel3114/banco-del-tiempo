package es.tfg.bancodeltiempo.configuration.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import es.tfg.bancodeltiempo.configuration.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class AuthTokenFilter
        extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {

            String jwt =
                this.parseJwt(request);

            if (jwt != null
                    && this.jwtUtils.validateJwtToken(jwt)) {

                String email =
                    this.jwtUtils
                        .getUserNameFromJwtToken(jwt);

                UserDetails userDetails =
                    this.userDetailsService
                        .loadUserByUsername(email);

                if (
                    userDetails.isAccountNonLocked() &&
                    userDetails.isAccountNonExpired() &&
                    userDetails.isCredentialsNonExpired() &&
                    userDetails.isEnabled()
                ) {

                    UsernamePasswordAuthenticationToken
                        authentication =
                            new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );

                    SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
                }
            }

        } catch (Exception e) {

            logger.error(
                "Cannot set user authentication",
                e
            );
        }

        filterChain.doFilter(
            request,
            response
        );
    }

    private String parseJwt(
            HttpServletRequest request) {

        String headerAuth =
            request.getHeader(
                "Authorization"
            );

        if (
            StringUtils.hasText(
                headerAuth
            ) &&
            headerAuth.startsWith(
                "Bearer "
            )
        ) {

            return headerAuth.substring(
                7
            );
        }

        return null;
    }
}