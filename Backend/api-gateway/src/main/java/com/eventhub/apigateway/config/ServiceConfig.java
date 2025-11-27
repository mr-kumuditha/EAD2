package com.eventhub.apigateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceConfig {

    @Value("${service.auth}")
    private String authService;

    @Value("${service.event}")
    private String eventService;

    @Value("${service.ticket}")
    private String ticketService;

    @Value("${service.booking}")
    private String bookingService;

    @Value("${service.report}")
    private String reportService;

    public String getAuthService() { return authService; }
    public String getEventService() { return eventService; }
    public String getTicketService() { return ticketService; }
    public String getBookingService() { return bookingService; }
    public String getReportService() { return reportService; }
}