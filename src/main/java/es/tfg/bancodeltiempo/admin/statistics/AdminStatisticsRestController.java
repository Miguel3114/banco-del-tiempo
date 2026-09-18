package es.tfg.bancodeltiempo.admin.statistics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/statistics")
public class AdminStatisticsRestController {

    private final AdminStatisticsService adminStatisticsService;

    @Autowired
    public AdminStatisticsRestController(AdminStatisticsService adminStatisticsService) {
        this.adminStatisticsService = adminStatisticsService;
    }

    @GetMapping
    public ResponseEntity<AdminStatisticsDTO> findStatistics() {
        return ResponseEntity.ok(this.adminStatisticsService.findStatistics());
    }
}