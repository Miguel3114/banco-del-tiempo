package es.tfg.bancodeltiempo.user;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import es.tfg.bancodeltiempo.skill.Skill;
import lombok.Getter;

@Getter
public class CurrentUserDTO {

    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String biography;
    private String profileImageUrl;
    private Integer hourBalance;
    private BigDecimal averageRating;
    private Set<Skill> skills;

    public CurrentUserDTO(User user, Integer hourBalance, BigDecimal averageRating) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.biography = user.getBiography();
        this.profileImageUrl = user.getProfileImageUrl();
        this.hourBalance = hourBalance;
        this.averageRating = averageRating;
        this.skills = new HashSet<>(user.getSkills());
    }
}