package es.tfg.bancodeltiempo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;

@Component
public class BancoDelTiempoInitializer
        implements CommandLineRunner {

    private SkillService skillService;

    @Autowired
    public BancoDelTiempoInitializer(
            SkillService skillService) {

        this.skillService = skillService;
    }

    @Override
    public void run(String... args) throws Exception {
        this.createSkill("Informática");
        this.createSkill("Idiomas");
        this.createSkill("Cocina");
        this.createSkill("Jardinería");
        this.createSkill("Bricolaje");
        this.createSkill("Cuidados");
    }

    private void createSkill(String name) {
        if (!this.skillService.existsSkill(name)) {
            Skill skill = new Skill();
            skill.setName(name);
            this.skillService.saveSkill(skill);
        }
    }
}