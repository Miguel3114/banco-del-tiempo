package es.tfg.bancodeltiempo.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends CrudRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.registeredAt DESC")
    List<User> findUsers(@Param("role") Role role);
}