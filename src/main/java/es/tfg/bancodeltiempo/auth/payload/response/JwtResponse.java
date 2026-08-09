package es.tfg.bancodeltiempo.auth.payload.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponse {

    private String token;
    private String type = "Bearer";
    private Integer id;
    private String email;
    private List<String> roles;

    public JwtResponse(
            String accessToken,
            Integer id,
            String email,
            List<String> roles) {

        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.roles = roles;
    }

    @Override
    public String toString() {
        return "JwtResponse [token=" + token
                + ", type=" + type
                + ", id=" + id
                + ", email=" + email
                + ", roles=" + roles + "]";
    }
}