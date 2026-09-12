package es.tfg.bancodeltiempo.exchange;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ExchangeRepository extends CrudRepository<Exchange, Integer> {

    @Query("SELECT e FROM Exchange e WHERE e.chat.id = :chatId")
    Optional<Exchange> findByChat(@Param("chatId") Integer chatId);

    Boolean existsByChatId(Integer chatId);

    @Query("SELECT e FROM Exchange e WHERE e.status = :status AND "
            + "(e.chat.listing.author.id = :userId OR e.chat.interestedUser.id = :userId) "
            + "ORDER BY e.registeredAt DESC")
    List<Exchange> findByUserAndStatus(@Param("userId") Integer userId,
            @Param("status") ExchangeStatus status);
}