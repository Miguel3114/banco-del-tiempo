package es.tfg.bancodeltiempo.listing;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/listings")
public class ListingRestController {

    private final ListingService listingService;

    @Autowired
    public ListingRestController(
            ListingService listingService) {

        this.listingService = listingService;
    }

    @GetMapping
    public ResponseEntity<List<Listing>> findAll(
            @RequestParam("type")
            ListingType listingType,

            @RequestParam(
                    value = "categoryId",
                    required = false)
            Integer categoryId,

            @RequestParam(
                    value = "search",
                    required = false)
            String search) {

        List<Listing> listings =
                this.listingService.findActiveListings(
                        listingType,
                        categoryId,
                        search);

        return ResponseEntity.ok(listings);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Listing>> findMine() {

        List<Listing> listings =
                this.listingService.findMyListings();

        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> findById(
            @PathVariable("id")
            Integer id) {

        Listing listing =
                this.listingService
                        .findActiveListingById(id);

        return ResponseEntity.ok(listing);
    }

    @PostMapping
    public ResponseEntity<Listing> create(
            @Valid
            @RequestBody
            ListingCreateRequest request) {

        Listing listing =
                this.listingService
                        .createListing(request);

        return ResponseEntity.ok(listing);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Listing> update(
            @PathVariable("id")
            Integer id,

            @Valid
            @RequestBody
            ListingUpdateRequest request) {

        Listing listing =
                this.listingService
                        .updateListing(
                                id,
                                request);

        return ResponseEntity.ok(listing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id")
            Integer id) {

        this.listingService
                .deleteListing(id);

        return ResponseEntity.noContent().build();
    }
}