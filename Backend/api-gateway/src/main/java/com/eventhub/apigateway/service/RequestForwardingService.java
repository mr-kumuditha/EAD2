package com.eventhub.apigateway.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.util.LinkedMultiValueMap;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Service
public class RequestForwardingService {

    @Autowired
    private RestTemplate restTemplate;

    public ResponseEntity<?> forwardRequest(String targetUrl, HttpMethod method,
            String path, String queryString,
            HttpHeaders headers, Object body) {
        try {
            // Build the target URL with path and query parameters
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(targetUrl + path);

            if (queryString != null && !queryString.isEmpty()) {
                // Parse and add query parameters
                String[] queryParams = queryString.split("&");
                for (String param : queryParams) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2) {
                        uriBuilder.queryParam(keyValue[0], keyValue[1]);
                    }
                }
            }

            URI fullUri = uriBuilder.build().toUri();

            // Create request entity with headers and body
            HttpEntity<Object> entity;

            // Check if this is a multipart request by examining content-type
            String contentType = headers.getFirst("Content-Type");
            if (contentType != null && contentType.contains("multipart/form-data")) {
                // For multipart requests, we need to parse the byte array into MultiValueMap
                if (body instanceof byte[]) {
                    try {
                        // Parse multipart data from byte array
                        MultiValueMap<String, Object> multipartData = parseMultipartData((byte[]) body, contentType);

                        // Create headers for multipart request
                        HttpHeaders multipartHeaders = new HttpHeaders();
                        multipartHeaders.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
                        // Copy other necessary headers but not content-type or content-length
                        headers.forEach((key, values) -> {
                            if (!"content-type".equalsIgnoreCase(key) &&
                                    !"content-length".equalsIgnoreCase(key) &&
                                    !"host".equalsIgnoreCase(key)) {
                                multipartHeaders.put(key, values);
                            }
                        });

                        entity = new HttpEntity<>(multipartData, multipartHeaders);

                        // Use RestTemplate with byte array response for multipart
                        ResponseEntity<byte[]> response = restTemplate.exchange(
                                fullUri, method, entity, byte[].class);
                        HttpHeaders responseHeaders = filterResponseHeaders(response.getHeaders());
                        return new ResponseEntity<>(response.getBody(), responseHeaders, response.getStatusCode());

                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Failed to parse multipart data: " + e.getMessage());
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid multipart request format");
                }
            } else if (body instanceof byte[]) {
                // For byte array body (JSON), create entity with byte array directly
                entity = new HttpEntity<>((byte[]) body, headers);
                // Forward the request using RestTemplate. Using byte[] keeps content type
                // opaque.
                ResponseEntity<byte[]> response = restTemplate.exchange(
                        fullUri, method, entity, byte[].class);
                HttpHeaders responseHeaders = filterResponseHeaders(response.getHeaders());
                return new ResponseEntity<>(response.getBody(), responseHeaders, response.getStatusCode());
            } else if (body instanceof MultiValueMap) {
                // For multipart body, use MultiValueMap
                entity = new HttpEntity<>((MultiValueMap<String, Object>) body, headers);
                // Forward the request using RestTemplate for multipart
                ResponseEntity<byte[]> response = restTemplate.exchange(
                        fullUri, method, entity, byte[].class);
                HttpHeaders responseHeaders = filterResponseHeaders(response.getHeaders());
                return new ResponseEntity<>(response.getBody(), responseHeaders, response.getStatusCode());
            } else {
                // For other types, use as is
                entity = new HttpEntity<>(body, headers);
                // Forward the request using RestTemplate. Using byte[] keeps content type
                // opaque.
                ResponseEntity<byte[]> response = restTemplate.exchange(
                        fullUri, method, entity, byte[].class);
                HttpHeaders responseHeaders = filterResponseHeaders(response.getHeaders());
                return new ResponseEntity<>(response.getBody(), responseHeaders, response.getStatusCode());
            }

        } catch (RestClientResponseException e) {
            HttpHeaders responseHeaders = filterResponseHeaders(e.getResponseHeaders());
            byte[] responseBody = e.getResponseBodyAsByteArray();
            return new ResponseEntity<>(responseBody, responseHeaders, e.getStatusCode());

        } catch (ResourceAccessException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Service unavailable");
            errorResponse.put("message", "Unable to reach downstream service");
            errorResponse.put("service", targetUrl);

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(errorResponse);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Gateway error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("service", targetUrl);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    public HttpHeaders copyHeaders(HttpHeaders originalHeaders) {
        HttpHeaders newHeaders = new HttpHeaders();

        // Copy all headers except those we want to skip
        originalHeaders.forEach((headerName, headerValues) -> {
            if (!shouldSkipHeader(headerName)) {
                newHeaders.put(headerName, headerValues);
            }
        });

        // Do not set default content type, let the original content type be preserved
        return newHeaders;
    }

    private boolean shouldSkipHeader(String headerName) {
        // Skip headers that should not be forwarded to the target service
        return headerName.equalsIgnoreCase("host") ||
                headerName.equalsIgnoreCase("content-length");
    }

    private HttpHeaders filterResponseHeaders(HttpHeaders source) {
        HttpHeaders filtered = new HttpHeaders();
        if (source == null) {
            return filtered;
        }

        source.forEach((headerName, headerValues) -> {
            if (!HttpHeaders.TRANSFER_ENCODING.equalsIgnoreCase(headerName)) {
                filtered.put(headerName, headerValues);
            }
        });

        return filtered;
    }

    private MultiValueMap<String, Object> parseMultipartData(byte[] body, String contentType) throws Exception {
        // Extract boundary from content-type header
        String boundary = extractBoundary(contentType);
        if (boundary == null) {
            throw new Exception("No boundary found in Content-Type");
        }

        // Convert boundary to bytes for binary parsing
        byte[] boundaryBytes = ("--" + boundary).getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] endBoundaryBytes = ("--" + boundary + "--").getBytes(java.nio.charset.StandardCharsets.UTF_8);

        LinkedMultiValueMap<String, Object> multipartData = new LinkedMultiValueMap<>();

        int start = 0;
        while (start < body.length) {
            // Find next boundary
            int boundaryIndex = indexOf(body, boundaryBytes, start);
            if (boundaryIndex == -1) break;

            // Check if this is the end boundary
            if (startsWith(body, endBoundaryBytes, boundaryIndex)) break;

            // Move past boundary
            int partStart = boundaryIndex + boundaryBytes.length;
            if (partStart < body.length && body[partStart] == '\r') partStart += 2; // Skip \r\n

            // Find next boundary or end
            int nextBoundaryIndex = indexOf(body, boundaryBytes, partStart);
            if (nextBoundaryIndex == -1) nextBoundaryIndex = body.length;

            // Extract part content
            byte[] partContent = new byte[nextBoundaryIndex - partStart];
            System.arraycopy(body, partStart, partContent, 0, partContent.length);

            // Parse the part
            parsePart(partContent, multipartData);

            start = nextBoundaryIndex;
        }

        return multipartData;
    }

    private void parsePart(byte[] partContent, LinkedMultiValueMap<String, Object> multipartData) {
        // Find header end (double CRLF)
        int headerEnd = -1;
        for (int i = 0; i < partContent.length - 3; i++) {
            if (partContent[i] == '\r' && partContent[i+1] == '\n' &&
                partContent[i+2] == '\r' && partContent[i+3] == '\n') {
                headerEnd = i;
                break;
            }
        }

        if (headerEnd == -1) return;

        // Parse headers
        String headers = new String(partContent, 0, headerEnd, java.nio.charset.StandardCharsets.UTF_8);
        byte[] content = new byte[partContent.length - headerEnd - 4];
        System.arraycopy(partContent, headerEnd + 4, content, 0, content.length);

        // Extract field name
        String fieldName = extractFieldName(headers);
        if (fieldName != null) {
            if (headers.contains("filename=")) {
                // File field
                String filename = extractFilename(headers);
                if (filename != null) {
                    org.springframework.core.io.ByteArrayResource resource =
                        new org.springframework.core.io.ByteArrayResource(content) {
                            @Override
                            public String getFilename() {
                                return filename;
                            }
                        };
                    multipartData.add(fieldName, resource);
                }
            } else {
                // Text field
                String textContent = new String(content, java.nio.charset.StandardCharsets.UTF_8).trim();
                multipartData.add(fieldName, textContent);
            }
        }
    }

    private int indexOf(byte[] array, byte[] target, int start) {
        for (int i = start; i <= array.length - target.length; i++) {
            boolean found = true;
            for (int j = 0; j < target.length; j++) {
                if (array[i + j] != target[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return i;
        }
        return -1;
    }

    private boolean startsWith(byte[] array, byte[] prefix, int offset) {
        if (offset + prefix.length > array.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (array[offset + i] != prefix[i]) return false;
        }
        return true;
    }

    private String extractBoundary(String contentType) {
        if (contentType == null) return null;
        String[] parts = contentType.split(";");
        for (String part : parts) {
            part = part.trim();
            if (part.startsWith("boundary=")) {
                return part.substring(9);
            }
        }
        return null;
    }

    private String extractFieldName(String headers) {
        String[] lines = headers.split("\r\n");
        for (String line : lines) {
            if (line.toLowerCase().startsWith("content-disposition:")) {
                String[] parts = line.split(";");
                for (String part : parts) {
                    part = part.trim();
                    if (part.startsWith("name=")) {
                        return part.substring(5).replaceAll("\"", "");
                    }
                }
            }
        }
        return null;
    }

    private String extractFilename(String headers) {
        String[] lines = headers.split("\r\n");
        for (String line : lines) {
            if (line.toLowerCase().startsWith("content-disposition:")) {
                String[] parts = line.split(";");
                for (String part : parts) {
                    part = part.trim();
                    if (part.startsWith("filename=")) {
                        return part.substring(9).replaceAll("\"", "");
                    }
                }
            }
        }
        return null;
    }

    private String extractContentType(String headers) {
        String[] lines = headers.split("\r\n");
        for (String line : lines) {
            if (line.toLowerCase().startsWith("content-type:")) {
                return line.substring(13).trim();
            }
        }
        return null;
    }
}
