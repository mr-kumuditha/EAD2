# Event Booking User Flow Implementation

## Overview
Create a modern user flow for the event system:
1. Ticket selection → Confirm Booking → Payment Page → Booking Details Page

## Tasks

### 1. Update TicketBooking Component
- [ ] Change "Book Now" button to "Confirm Booking"
- [ ] On click, reserve tickets using bookingService.reserveTickets
- [ ] Redirect to /payment with booking data (eventId, ticketType, qty, price, bookingId)

### 2. Create PaymentPage Component
- [ ] Create Frontend/src/pages/PaymentPage.tsx
- [ ] Display booking summary card (event name, date, ticket type, qty, total)
- [ ] Payment form: card name, card number, expiry, CVV
- [ ] "Pay Now" button with loading animation
- [ ] Validate form inputs
- [ ] On pay: call bookingService.confirmBooking
- [ ] On success: redirect to /my-bookings/{bookingRef}
- [ ] On fail: show retry error

### 3. Create BookingDetailsPage Component
- [ ] Create Frontend/src/pages/BookingDetailsPage.tsx
- [ ] Fetch booking by bookingRef from URL params
- [ ] Receipt Section: booking ref, event name, date/time, venue, ticket type, qty, price/total, payment status, download receipt button
- [ ] E-Ticket Card: event name, ticket type, QR code, user name, booking ref, subtle background, rounded card with shadow
- [ ] Buttons: "Download E-Ticket", "Go to My Bookings"

### 4. Update Routing
- [ ] Update Frontend/src/App.tsx to add routes for /payment and /my-bookings/:bookingRef

### 5. Install Dependencies
- [ ] Install qrcode.react for QR code generation
- [ ] Install jsPDF for PDF downloads (if needed)

### 6. Styling and Responsiveness
- [ ] Apply premium styling: white panels, soft shadows, rounded corners, smooth transitions
- [ ] Ensure mobile and desktop compatibility
- [ ] Add hover animations

### 7. Testing
- [ ] Test full flow: ticket selection → confirm → payment → success → details
- [ ] Test error handling (payment fail)
- [ ] Test QR code generation
- [ ] Test download functionality
