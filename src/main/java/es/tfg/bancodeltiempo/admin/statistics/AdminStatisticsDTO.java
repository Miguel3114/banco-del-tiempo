package es.tfg.bancodeltiempo.admin.statistics;

import lombok.Getter;

@Getter
public class AdminStatisticsDTO {

    private long totalUsers;
    private long activeListings;
    private long totalHours;

    public AdminStatisticsDTO(long totalUsers, long activeListings, long totalHours) {
        this.totalUsers = totalUsers;
        this.activeListings = activeListings;
        this.totalHours = totalHours;
    }
}