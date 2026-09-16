package es.tfg.bancodeltiempo.listing;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface ListingRepository extends CrudRepository<Listing, Integer> {

        List<Listing> findAll();

        @Query("""
                        SELECT l
                        FROM Listing l
                        WHERE l.listingStatus = :status
                        AND l.listingType = :type
                        AND l.author.id <> :authorId
                        AND (:categoryId IS NULL OR l.category.id = :categoryId)
                        AND (:search IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')))
                        ORDER BY l.publishedAt DESC
                        """)
        List<Listing> findPublic(@Param("status") ListingStatus status,
                        @Param("type") ListingType type,
                        @Param("authorId") Integer authorId,
                        @Param("categoryId") Integer categoryId,
                        @Param("search") String search);

        @Query("""
                        SELECT l
                        FROM Listing l
                        WHERE l.author.id = :authorId
                        AND l.listingStatus = :status
                        ORDER BY l.publishedAt DESC
                        """)
        List<Listing> findByAuthor(@Param("authorId") Integer authorId,
                        @Param("status") ListingStatus status);

        @Query("""
                        SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END
                        FROM Listing l
                        WHERE l.category.id = :categoryId
                        AND l.listingStatus = :status
                        """)
        boolean hasListings(@Param("categoryId") Integer categoryId,
                        @Param("status") ListingStatus status);

        @Query("""
                        SELECT COUNT(l)
                        FROM Listing l
                        WHERE l.category.id = :categoryId
                        """)
        long countByCategory(@Param("categoryId") Integer categoryId);

        @Query("""
                        SELECT l
                        FROM Listing l
                        WHERE l.listingStatus = :status
                        ORDER BY l.publishedAt DESC
                        """)
        List<Listing> findAdminListings(@Param("status") ListingStatus status);
}