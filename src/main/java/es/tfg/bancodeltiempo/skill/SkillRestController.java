package es.tfg.bancodeltiempo.skill;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skills")
public class SkillRestController {

    private SkillService skillService;

    @Autowired
    public SkillRestController(
            SkillService skillService) {

        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<Iterable<Skill>> findAll() {

        Iterable<Skill> skills =
            this.skillService.findAllSkills();

        return ResponseEntity.ok(skills);
    }
}