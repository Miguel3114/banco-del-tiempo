package es.tfg.bancodeltiempo.skill;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface SkillRepository extends CrudRepository<Skill, Integer> {

    Optional<Skill> findByName(String name);

    Boolean existsByName(String name);
}