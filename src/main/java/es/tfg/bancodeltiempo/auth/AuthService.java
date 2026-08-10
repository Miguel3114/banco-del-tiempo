package es.tfg.bancodeltiempo.auth;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.auth.payload.request.UserRegisterRequest;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;
import jakarta.validation.Valid;

@Service
public class AuthService {

    private final PasswordEncoder encoder;
    private final UserService userService;
    private final SkillService skillService;

    @Autowired
    public AuthService(
            PasswordEncoder encoder,
            UserService userService,
            SkillService skillService) {

        this.encoder = encoder;
        this.userService = userService;
        this.skillService = skillService;
    }

    @Transactional
    public void createMemberUser(
            @Valid UserRegisterRequest request) {

        String email = request.getEmail()
            .trim()
            .toLowerCase(Locale.ROOT);

        if (this.userService.existsUser(email)) {
            throw new IllegalArgumentException(
                "El correo electrónico ya está registrado"
            );
        }

        Set<Skill> skills = new HashSet<>();

        if (request.getSkillIds() != null
                && !request.getSkillIds().isEmpty()) {

            skills = this.skillService.findSkillsByIds(
                request.getSkillIds()
            );

            if (skills.size() != request.getSkillIds().size()) {
                throw new IllegalArgumentException(
                    "Una o varias habilidades no existen"
                );
            }
        }

        User user = new User();

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setPassword(
            this.encoder.encode(request.getPassword())
        );
        user.setBiography(request.getBiography());
        user.setSkills(skills);

        this.userService.saveUser(user);
    }
}