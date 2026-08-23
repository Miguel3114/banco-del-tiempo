package es.tfg.bancodeltiempo.category;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

public interface CategoryRepository extends CrudRepository<Category, Integer> {

        List<Category> findAll();

        Optional<Category> findByName(
                        String name);

        Boolean existsByName(
                        String name);

        List<Category> findByStatus(
                        CategoryStatus status);
}