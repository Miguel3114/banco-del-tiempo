package es.tfg.bancodeltiempo.review;

import java.time.LocalDateTime;

import lombok.Getter;

@Getter
public class ReviewDTO {

    private Integer id;
    private Integer exchangeId;

    private Integer listingId;
    private String listingTitle;

    private Integer authorId;
    private String authorFirstName;
    private String authorLastName;
    private String authorProfileImageUrl;

    private Integer reviewedUserId;

    private Integer rating;
    private String comment;
    private LocalDateTime publishedAt;

    public ReviewDTO(Review review) {
        this.id = review.getId();
        this.exchangeId = review.getExchange().getId();

        this.listingId = review.getExchange().getChat().getListing().getId();
        this.listingTitle = review.getExchange().getChat().getListing().getTitle();

        this.authorId = review.getAuthor().getId();
        this.authorFirstName = review.getAuthor().getFirstName();
        this.authorLastName = review.getAuthor().getLastName();
        this.authorProfileImageUrl = review.getAuthor().getProfileImageUrl();

        this.reviewedUserId = review.getReviewedUser().getId();

        this.rating = review.getRating();
        this.comment = review.getComment();
        this.publishedAt = review.getPublishedAt();
    }
}