package es.tfg.bancodeltiempo.skill;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillService {

    private SkillRepository skillRepository;

    @Autowired
    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public Set<Skill> findSkillsByIds(Set<Integer> skillIds) {
        Set<Skill> skills = new HashSet<>();

        this.skillRepository.findAllById(skillIds).forEach(skills::add);

        return skills;
    }

    public Boolean existsSkill(String name) {
        return this.skillRepository.existsByName(name);
    }

    @Transactional
    public Skill saveSkill(Skill skill) throws DataAccessException {
        this.skillRepository.save(skill);
        return skill;
    }

    @Transactional(readOnly = true)
    public Iterable<Skill> findAllSkills() {
        return this.skillRepository.findAll();
    }
}
