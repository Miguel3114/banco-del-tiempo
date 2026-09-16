package es.tfg.bancodeltiempo.admin.review;

import es.tfg.bancodeltiempo.review.Review;
import lombok.Getter;

@Getter
public class AdminReviewDTO {

    private Integer id;
    private String listingTitle;
    private String authorName;
    private String reviewedUserName;
    private Integer rating;
    private String comment;

    public AdminReviewDTO(Review review) {
        this.id = review.getId();
        this.listingTitle = review.getExchange().getChat().getListing().getTitle();
        this.authorName = review.getAuthor().getFirstName() + " " + review.getAuthor().getLastName();
        this.reviewedUserName = review.getReviewedUser().getFirstName() + " "
                + review.getReviewedUser().getLastName();
        this.rating = review.getRating();
        this.comment = review.getComment();
    }
}