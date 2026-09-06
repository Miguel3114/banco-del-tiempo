package es.tfg.bancodeltiempo.message;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends CrudRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.sentAt ASC")
    List<Message> findByChat(@Param("chatId") Integer chatId);

    @Query("SELECT m FROM Message m WHERE m.id = (SELECT MAX(m2.id) FROM Message m2 WHERE m2.chat.id = :chatId)")
    Optional<Message> findLast(@Param("chatId") Integer chatId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.sender IS NOT NULL AND m.sender.id <> :userId AND m.readStatus = :status")
    Long countUnread(@Param("chatId") Integer chatId, @Param("userId") Integer userId,
            @Param("status") ReadStatus status);
}