package es.tfg.bancodeltiempo.admin.listing;

import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingType;
import lombok.Getter;

@Getter
public class AdminListingDTO {

    private Integer id;
    private String title;
    private String categoryName;
    private ListingType listingType;
    private Integer authorId;
    private String authorName;

    public AdminListingDTO(Listing listing) {
        this.id = listing.getId();
        this.title = listing.getTitle();
        this.categoryName = listing.getCategory().getName();
        this.listingType = listing.getListingType();
        this.authorName = listing.getAuthor().getFirstName() + " " + listing.getAuthor().getLastName();
    }
}