package es.tfg.bancodeltiempo.configuration;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration
        implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(
            CorsRegistry registry) {

        registry
            .addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:3000"
            )
            .allowedMethods(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
            .allowedHeaders(
                "Authorization",
                "Content-Type"
            );
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        String uploadPath =
            Paths.get("uploads")
                .toAbsolutePath()
                .toUri()
                .toString();

        registry
            .addResourceHandler(
                "/uploads/**"
            )
            .addResourceLocations(
                uploadPath
            );
    }
}