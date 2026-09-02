package es.tfg.bancodeltiempo.message;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends CrudRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.sentAt ASC")
    List<Message> findByChat(@Param("chatId") Integer chatId);
}