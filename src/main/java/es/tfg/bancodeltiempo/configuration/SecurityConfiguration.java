package es.tfg.bancodeltiempo.configuration;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import es.tfg.bancodeltiempo.configuration.jwt.AuthEntryPointJwt;
import es.tfg.bancodeltiempo.configuration.jwt.AuthTokenFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    protected SecurityFilterChain configure(
            HttpSecurity http) throws Exception {

        http
            .cors(withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .headers(headers ->
                headers.frameOptions(frameOptions ->
                    frameOptions.sameOrigin()
                )
            )

            .exceptionHandling(exceptionHandling ->
                exceptionHandling
                    .authenticationEntryPoint(
                        this.unauthorizedHandler
                    )
            )

            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests

                    .requestMatchers(
                        PathRequest.toH2Console()
                    ).permitAll()

                    .requestMatchers(
                        "/api/auth/**"
                    ).permitAll()

                    .requestMatchers(
                        HttpMethod.GET,
                        "/uploads/**"
                    ).permitAll()

                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/skills")
                    .permitAll()

                    .anyRequest().authenticated()
            )

            .formLogin(formLogin ->
                formLogin.disable()
            )

            .httpBasic(httpBasic ->
                httpBasic.disable()
            )

            .addFilterBefore(
                this.authenticationJwtTokenFilter(),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public AuthTokenFilter
            authenticationJwtTokenFilter() {

        return new AuthTokenFilter();
    }

    @Bean
    public AuthenticationManager
            authenticationManager(
                AuthenticationConfiguration config)
                throws Exception {

        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}