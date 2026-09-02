package es.tfg.bancodeltiempo.user;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import es.tfg.bancodeltiempo.skill.Skill;
import lombok.Getter;

@Getter
public class UserDTO {

    private Integer id;
    private String firstName;
    private String lastName;
    private String biography;
    private String profileImageUrl;
    private Integer hourBalance;
    private BigDecimal averageRating;
    private Set<Skill> skills;

    public UserDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.biography = user.getBiography();
        this.profileImageUrl = user.getProfileImageUrl();
        this.hourBalance = user.getHourBalance();
        this.averageRating = user.getAverageRating();
        this.skills = new HashSet<>(user.getSkills());
    }
}