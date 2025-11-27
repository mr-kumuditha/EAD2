package com.eventhub.apigateway.Controlleer;

import com.eventhub.apigateway.config.ServiceConfig;
import com.eventhub.apigateway.service.RequestForwardingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class GatewayController {

    @Autowired
    private ServiceConfig serviceConfig;

    @Autowired
    private RequestForwardingService forwardingService;

    // ---------------- AUTH SERVICE ----------------
    @RequestMapping(value = "/auth/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<?> routeToAuthService(
            @RequestBody(required = false) Object body,
            @RequestHeader HttpHeaders headers,
            HttpMethod method,
            @RequestParam Map<String, String> allParams,
            HttpServletRequest request) {

        String targetUrl = serviceConfig.getAuthService();
        String pathAfterApi = extractPathAfterApi(request, "/auth");
        String queryString = buildQueryString(allParams);
        HttpHeaders filteredHeaders = forwardingService.copyHeaders(headers);

        return forwardingService.forwardRequest(targetUrl, method, pathAfterApi, queryString, filteredHeaders, body);
    }

    // ---------------- EVENT SERVICE ----------------
    @RequestMapping(value = "/events/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<?> routeToEventService(
            HttpServletRequest request,
            @RequestHeader HttpHeaders headers,
            HttpMethod method,
            @RequestParam Map<String, String> allParams) {

        String targetUrl = serviceConfig.getEventService();
        String pathAfterApi = extractPathAfterApi(request, "/events");
        String queryString = buildQueryString(allParams);
        HttpHeaders filteredHeaders = forwardingService.copyHeaders(headers);

        // Handle request body for POST/PUT - stream raw body to preserve multipart boundaries
        Object body = null;
        if (HttpMethod.POST.equals(method) || HttpMethod.PUT.equals(method)) {
            try {
                byte[] bodyBytes = request.getInputStream().readAllBytes();
                if (bodyBytes.length > 0) {
                    body = bodyBytes;
                }
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Error reading request body: " + e.getMessage());
            }
        }

        return forwardingService.forwardRequest(targetUrl, method, pathAfterApi, queryString, filteredHeaders, body);
    }

    // ---------------- TICKET SERVICE ----------------
    @RequestMapping(value = "/tickets/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<?> routeToTicketService(
            @RequestBody(required = false) Object body,
            @RequestHeader HttpHeaders headers,
            HttpMethod method,
            @RequestParam Map<String, String> allParams,
            HttpServletRequest request) {

        String targetUrl = serviceConfig.getTicketService();
        String pathAfterApi = extractPathAfterApi(request, "/tickets");
        String queryString = buildQueryString(allParams);
        HttpHeaders filteredHeaders = forwardingService.copyHeaders(headers);

        return forwardingService.forwardRequest(targetUrl, method, pathAfterApi, queryString, filteredHeaders, body);
    }

    // ---------------- BOOKING SERVICE ----------------
    @RequestMapping(value = "/bookings/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<?> routeToBookingService(
            @RequestBody(required = false) Object body,
            @RequestHeader HttpHeaders headers,
            HttpMethod method,
            @RequestParam Map<String, String> allParams,
            HttpServletRequest request) {

        String targetUrl = serviceConfig.getBookingService();
        String pathAfterApi = extractPathAfterApi(request, "/bookings");
        String queryString = buildQueryString(allParams);
        HttpHeaders filteredHeaders = forwardingService.copyHeaders(headers);

        return forwardingService.forwardRequest(targetUrl, method, pathAfterApi, queryString, filteredHeaders, body);
    }

    // ---------------- REPORT SERVICE ----------------
    @RequestMapping(value = "/reports/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
    public ResponseEntity<?> routeToReportService(
            @RequestBody(required = false) Object body,
            @RequestHeader HttpHeaders headers,
            HttpMethod method,
            @RequestParam Map<String, String> allParams,
            HttpServletRequest request) {

        String targetUrl = serviceConfig.getReportService();
        String pathAfterApi = extractPathAfterApi(request, "/reports");
        String queryString = buildQueryString(allParams);
        HttpHeaders filteredHeaders = forwardingService.copyHeaders(headers);

        return forwardingService.forwardRequest(targetUrl, method, pathAfterApi, queryString, filteredHeaders, body);
    }

    // ---------------- HELPERS ----------------
    private String extractPathAfterApi(HttpServletRequest request, String servicePrefix) {
        String uri = request.getRequestURI();
        if (uri == null) return "";
        int idx = uri.indexOf(servicePrefix);
        if (idx >= 0) {
            return uri.substring(idx);
        }
        return "";
    }

    private String buildQueryString(Map<String, String> allParams) {
        if (allParams.isEmpty()) return null;
        StringBuilder queryString = new StringBuilder();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            if (queryString.length() > 0) queryString.append("&");
            queryString.append(entry.getKey()).append("=").append(entry.getValue());
        }
        return queryString.toString();
    }

    // ---------------- HEALTH ENDPOINTS ----------------
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("API Gateway is running");
    }

    @GetMapping("/status")
    public ResponseEntity<?> serviceStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("gateway", "UP");
        status.put("auth-service", checkServiceStatus(serviceConfig.getAuthService() + "/auth/health"));
        status.put("event-service",checkServiceStatus(serviceConfig.getEventService() + "/events/health"));
        status.put("ticket-service", "NOT_IMPLEMENTED");
        status.put("booking-service", "NOT_IMPLEMENTED");
        status.put("report-service", "NOT_IMPLEMENTED");

        return ResponseEntity.ok(status);
    }

    private String checkServiceStatus(String serviceUrl) {
        try {
            ResponseEntity<String> response = new org.springframework.web.client.RestTemplate()
                    .getForEntity(serviceUrl, String.class);
            return response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
