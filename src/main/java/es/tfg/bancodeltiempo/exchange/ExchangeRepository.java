package es.tfg.bancodeltiempo.exchange;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import es.tfg.bancodeltiempo.listing.ListingType;

public interface ExchangeRepository extends CrudRepository<Exchange, Integer> {

    @Query("SELECT e FROM Exchange e WHERE e.chat.id = :chatId")
    Optional<Exchange> findByChat(@Param("chatId") Integer chatId);

    Boolean existsByChatId(Integer chatId);

    @Query("SELECT e FROM Exchange e WHERE e.status = :status AND "
            + "(e.chat.listing.author.id = :userId OR e.chat.interestedUser.id = :userId) "
            + "ORDER BY e.registeredAt DESC")
    List<Exchange> findByUserAndStatus(@Param("userId") Integer userId,
            @Param("status") ExchangeStatus status);

    @Query("""
            SELECT COALESCE(SUM(e.hours), 0)
            FROM Exchange e
            WHERE e.status = :status
            """)
    long sumHoursByStatus(@Param("status") ExchangeStatus status);

    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN (
                        e.chat.listing.listingType = :offer
                        AND e.chat.listing.author.id = :userId
                    )
                    OR (
                        e.chat.listing.listingType = :request
                        AND e.chat.interestedUser.id = :userId
                    )
                    THEN e.hours
                    ELSE (0 - e.hours)
                END
            ), 0)
            FROM Exchange e
            WHERE e.status = :status
            AND (
                e.chat.listing.author.id = :userId
                OR e.chat.interestedUser.id = :userId
            )
            """)
    Long findHourBalance(@Param("userId") Integer userId,
            @Param("status") ExchangeStatus status,
            @Param("offer") ListingType offer,
            @Param("request") ListingType request);
}