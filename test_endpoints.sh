#!/bin/bash

echo "Testing Booking Service Endpoints on http://localhost:8084"
echo "=========================================="

# Health check
echo "1. GET /bookings/health"
curl -X GET http://localhost:8084/bookings/health
echo -e "\n"

# Get all bookings (admin)
echo "2. GET /bookings (admin)"
curl -X GET http://localhost:8084/bookings -H "X-User-Role: ADMIN"
echo -e "\n"

# Get user bookings
echo "3. GET /bookings/my-bookings (user)"
curl -X GET http://localhost:8084/bookings/my-bookings -H "X-User-Id: 1"
echo -e "\n"

# Get user bookings by status
echo "4. GET /bookings/my-bookings/status/PENDING (user)"
curl -X GET http://localhost:8084/bookings/my-bookings/status/PENDING -H "X-User-Id: 1"
echo -e "\n"

# Get event bookings (admin)
echo "5. GET /bookings/event/1 (admin)"
curl -X GET http://localhost:8084/bookings/event/1 -H "X-User-Role: ADMIN"
echo -e "\n"

# Get event bookings by status (admin)
echo "6. GET /bookings/event/1/status/CONFIRMED (admin)"
curl -X GET http://localhost:8084/bookings/event/1/status/CONFIRMED -H "X-User-Role: ADMIN"
echo -e "\n"

# Get expired bookings (admin)
echo "7. GET /bookings/expired (admin)"
curl -X GET http://localhost:8084/bookings/expired -H "X-User-Role: ADMIN"
echo -e "\n"

# Get booking by ID
echo "8. GET /bookings/1 (user)"
curl -X GET http://localhost:8084/bookings/1 -H "X-User-Id: 1" -H "X-User-Role: USER"
echo -e "\n"

# Get booking by reference
echo "9. GET /bookings/reference/REF123 (user)"
curl -X GET http://localhost:8084/bookings/reference/REF123 -H "X-User-Id: 1" -H "X-User-Role: USER"
echo -e "\n"

# Create booking
echo "10. POST /bookings (user)"
curl -X POST http://localhost:8084/bookings -H "Content-Type: application/json" -H "X-User-Id: 1" -d '{"eventId":1,"ticketId":12,"quantity":1}'
echo -e "\n"

# Confirm booking
echo "11. POST /bookings/1/confirm (user)"
curl -X POST http://localhost:8084/bookings/1/confirm -H "Content-Type: application/json" -H "X-User-Id: 1" -d '{"paymentMethod":"CREDIT_CARD","transactionId":"TXN123"}'
echo -e "\n"

# Cancel booking
echo "12. POST /bookings/1/cancel (user)"
curl -X POST http://localhost:8084/bookings/1/cancel -H "X-User-Id: 1"
echo -e "\n"

# Get confirmed bookings count
echo "13. GET /bookings/event/1/count"
curl -X GET http://localhost:8084/bookings/event/1/count
echo -e "\n"

# Expire pending bookings (admin)
echo "14. POST /bookings/expire-pending (admin)"
curl -X POST http://localhost:8084/bookings/expire-pending -H "X-User-Role: ADMIN"
echo -e "\n"

echo "Testing complete."
