package es.tfg.bancodeltiempo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryService;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;

@Component
public class BancoDelTiempoInitializer
        implements CommandLineRunner {

    private SkillService skillService;
    private CategoryService categoryService;

    @Autowired
    public BancoDelTiempoInitializer(
            SkillService skillService,
            CategoryService categoryService) {

        this.skillService = skillService;
        this.categoryService = categoryService;
    }

    @Override
    public void run(String... args) throws Exception {

        this.createSkills();
        this.createCategories();
    }

    private void createSkills() {
        this.createSkill("Informática");
        this.createSkill("Idiomas");
        this.createSkill("Cocina");
        this.createSkill("Jardinería");
        this.createSkill("Bricolaje");
        this.createSkill("Cuidados");
    }

    private void createCategories() {
        this.createCategory("Informática");
        this.createCategory("Idiomas");
        this.createCategory("Hogar");
        this.createCategory("Cuidados");
        this.createCategory("Educación");
        this.createCategory("Transporte");
        this.createCategory("Ocio");
        this.createCategory("Otros");
    }

    private void createSkill(String name) {

        if (!this.skillService.existsSkill(name)) {

            Skill skill = new Skill();
            skill.setName(name);

            this.skillService.saveSkill(skill);
        }
    }

    private void createCategory(String name) {

        if (!this.categoryService.existsCategory(name)) {

            Category category = new Category();

            category.setName(name);
            category.setStatus(CategoryStatus.ACTIVE);

            this.categoryService.saveCategory(category);
        }
    }
}