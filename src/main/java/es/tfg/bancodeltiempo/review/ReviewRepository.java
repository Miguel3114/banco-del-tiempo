package es.tfg.bancodeltiempo.review;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends CrudRepository<Review, Integer> {

    @Query("SELECT COUNT(r) FROM Review r WHERE r.exchange.id = :exchangeId AND r.author.id = :authorId")
    Long countReview(@Param("exchangeId") Integer exchangeId, @Param("authorId") Integer authorId);

    @Query("SELECT r FROM Review r WHERE r.reviewedUser.id = :userId ORDER BY r.publishedAt DESC")
    List<Review> findByUser(@Param("userId") Integer userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewedUser.id = :userId")
    Double findAverageRating(@Param("userId") Integer userId);

    @Query("""
            SELECT r
            FROM Review r
            JOIN FETCH r.exchange e
            JOIN FETCH e.chat c
            JOIN FETCH c.listing l
            JOIN FETCH r.author a
            JOIN FETCH r.reviewedUser ru
            ORDER BY r.publishedAt DESC
            """)
    List<Review> findAdminReviews();
}