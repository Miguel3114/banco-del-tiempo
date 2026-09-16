package es.tfg.bancodeltiempo.admin.listing;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/listings")
public class AdminListingRestController {

    private final AdminListingService adminListingService;

    @Autowired
    public AdminListingRestController(AdminListingService adminListingService) {
        this.adminListingService = adminListingService;
    }

    @GetMapping
    public ResponseEntity<List<AdminListingDTO>> findListings() {
        List<AdminListingDTO> listings = this.adminListingService.findListings()
                .stream()
                .map(AdminListingDTO::new)
                .toList();

        return ResponseEntity.ok(listings);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Integer id) {
        this.adminListingService.deleteListing(id);

        return ResponseEntity.noContent().build();
    }
}