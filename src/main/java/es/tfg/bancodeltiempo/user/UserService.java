package es.tfg.bancodeltiempo.user;

import java.io.IOException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfileImageService profileImageService;
    private final SkillService skillService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, ProfileImageService profileImageService,
            SkillService skillService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileImageService = profileImageService;
        this.skillService = skillService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User saveUser(User user) throws DataAccessException {
        this.userRepository.save(user);
        return user;
    }

    public Boolean existsUser(String email) {
        return this.userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public User findCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return this.userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public User findUser(Integer id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    @Transactional
    public User updateProfile(UserUpdateRequest request) {
        User user = this.findCurrentUser();

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (!email.equals(user.getEmail()) && this.existsUser(email)) {
            throw new ConflictException("El correo electrónico ya está registrado");
        }

        if (request.getSkillIds() != null) {
            Set<Skill> skills = new HashSet<>(this.skillService.findSkillsByIds(request.getSkillIds()));

            if (skills.size() != request.getSkillIds().size()) {
                throw new IllegalArgumentException("Una o varias habilidades no existen");
            }

            user.setSkills(skills);
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setBiography(request.getBiography() != null ? request.getBiography().trim() : null);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(this.passwordEncoder.encode(request.getPassword()));
        }

        return this.userRepository.save(user);
    }

    public User updateProfileImage(MultipartFile file) throws IOException {
        User user = this.findCurrentUser();
        String oldProfileImageUrl = user.getProfileImageUrl();
        String profileImageUrl = this.profileImageService.saveProfileImage(file, user.getId());

        user.setProfileImageUrl(profileImageUrl);
        User updatedUser = this.userRepository.save(user);

        if (oldProfileImageUrl != null && !oldProfileImageUrl.isBlank()) {
            this.profileImageService.deleteProfileImage(oldProfileImageUrl);
        }

        return updatedUser;
    }

    public User deleteProfileImage() throws IOException {
        User user = this.findCurrentUser();
        String profileImageUrl = user.getProfileImageUrl();

        user.setProfileImageUrl(null);
        User updatedUser = this.userRepository.save(user);

        if (profileImageUrl != null && !profileImageUrl.isBlank()) {
            this.profileImageService.deleteProfileImage(profileImageUrl);
        }

        return updatedUser;
    }
}