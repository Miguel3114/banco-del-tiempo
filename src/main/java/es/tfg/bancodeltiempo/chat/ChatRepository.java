package es.tfg.bancodeltiempo.chat;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ChatRepository extends CrudRepository<Chat, Integer> {

    @Query("SELECT c FROM Chat c WHERE c.listing.id = :listingId AND c.interestedUser.id = :userId")
    Optional<Chat> findChat(@Param("listingId") Integer listingId, @Param("userId") Integer userId);
}