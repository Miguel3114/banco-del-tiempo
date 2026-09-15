package es.tfg.bancodeltiempo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryService;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;
import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Component
public class BancoDelTiempoInitializer
        implements CommandLineRunner {

    private SkillService skillService;
    private CategoryService categoryService;
    private UserService userService;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public BancoDelTiempoInitializer(
            SkillService skillService,
            CategoryService categoryService,
            UserService userService,
            PasswordEncoder passwordEncoder) {

        this.skillService = skillService;
        this.categoryService = categoryService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        this.createSkills();
        this.createCategories();
        this.createAdmin();
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

    private void createAdmin() {

        String email =
                "admin@gmail.com";

        if (!this.userService.existsUser(email)) {

            User admin = new User();

            admin.setFirstName("Administrador");
            admin.setLastName("Banco del Tiempo");
            admin.setEmail(email);

            admin.setPassword(
                this.passwordEncoder.encode(
                    "admin111"
                )
            );

            admin.setRole(
                Role.ADMIN
            );

            admin.setAccountStatus(
                AccountStatus.ACTIVE
            );

            admin.setHourBalance(
                0
            );

            this.userService.saveUser(
                admin
            );
        }
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