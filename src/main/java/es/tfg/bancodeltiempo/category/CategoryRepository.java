package es.tfg.bancodeltiempo.category;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends CrudRepository<Category, Integer> {

    List<Category> findAll();

    Boolean existsByNameIgnoreCase(String name);

    List<Category> findByStatus(CategoryStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
            FROM Category c
            WHERE LOWER(c.name) = LOWER(:name)
            AND c.id <> :id
            """)
    boolean existsNameExcludingId(@Param("name") String name,
            @Param("id") Integer id);
}