package es.tfg.bancodeltiempo.listing;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class ListingRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ListingService listingService;

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldCreateListing() throws Exception {
        Listing listing = new Listing();

        listing.setId(1);
        listing.setTitle("Clases de Java");
        listing.setDescription(
                "Ofrezco clases de Java");
        listing.setListingType(
                ListingType.OFFER);
        listing.setEstimatedHours(2);
        listing.setListingStatus(
                ListingStatus.ACTIVE);

        when(listingService.createListing(
                any(ListingCreateRequest.class)))
                .thenReturn(listing);

        mockMvc.perform(
                post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Clases de Java",
                                    "description": "Ofrezco clases de Java",
                                    "categoryId": 1,
                                    "listingType": "OFFER",
                                    "estimatedHours": 2
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title")
                        .value("Clases de Java"))
                .andExpect(jsonPath("$.listingType")
                        .value("OFFER"))
                .andExpect(jsonPath("$.estimatedHours")
                        .value(2))
                .andExpect(jsonPath("$.listingStatus")
                        .value("ACTIVE"));
    }

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnBadRequestWhenTitleIsBlank()
            throws Exception {

        mockMvc.perform(
                post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "   ",
                                    "description": "Descripción",
                                    "categoryId": 1,
                                    "listingType": "OFFER",
                                    "estimatedHours": 2
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(listingService, never())
                .createListing(
                        any(ListingCreateRequest.class));
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, -1 })
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnBadRequestWhenEstimatedHoursAreInvalid(
            int hours) throws Exception {

        mockMvc.perform(
                post("/api/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Clases de Java",
                                    "description": "Descripción",
                                    "categoryId": 1,
                                    "listingType": "OFFER",
                                    "estimatedHours": %d
                                }
                                """.formatted(hours)))
                .andExpect(status().isBadRequest());

        verify(listingService, never())
                .createListing(
                        any(ListingCreateRequest.class));
    }
}