package es.tfg.bancodeltiempo.configuration;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import es.tfg.bancodeltiempo.admin.statistics.AdminStatisticsDTO;
import es.tfg.bancodeltiempo.admin.statistics.AdminStatisticsService;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class SecurityRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminStatisticsService adminStatisticsService;

    @Test
    void shouldReturnUnauthorizedWhenUserIsNotAuthenticated()
            throws Exception {

        mockMvc.perform(
                get("/api/admin/statistics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnForbiddenWhenMemberAccessesAdminEndpoint()
            throws Exception {

        mockMvc.perform(
                get("/api/admin/statistics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldAllowAdminToAccessAdminEndpoint()
            throws Exception {

        AdminStatisticsDTO statistics =
                new AdminStatisticsDTO(
                        10,
                        7,
                        25);

        when(adminStatisticsService.findStatistics())
                .thenReturn(statistics);

        mockMvc.perform(
                get("/api/admin/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers")
                        .value(10))
                .andExpect(jsonPath("$.activeListings")
                        .value(7))
                .andExpect(jsonPath("$.totalHours")
                        .value(25));
    }
}