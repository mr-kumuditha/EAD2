import jsPDF from 'jspdf';
import type { Booking } from '../types/booking';
import type { Event } from '../types';

export const generateReceiptPDF = (booking: Booking, event: Event) => {
    const doc = new jsPDF();

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Header
    doc.setFillColor(45, 78, 200); // Royal Blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('EventHub', 20, 25);
    doc.setFontSize(12);
    doc.text('Booking Receipt', 150, 25);

    // Event Details
    doc.setTextColor(26, 28, 44); // Dark Navy
    doc.setFontSize(18);
    doc.text(event.name, 20, 60);

    doc.setFontSize(12);
    doc.setTextColor(110, 118, 135); // Cool Gray
    doc.text(formatDate(event.date), 20, 70);
    doc.text(event.location, 20, 80);

    // Booking Details Box
    doc.setDrawColor(233, 236, 242);
    doc.setFillColor(245, 247, 251);
    doc.roundedRect(20, 95, 170, 90, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(110, 118, 135);
    doc.text('Booking Reference', 30, 110);
    doc.text('Ticket Type', 30, 130);
    doc.text('Quantity', 110, 130);
    doc.text('Payment Status', 30, 150);
    doc.text('Total Amount', 110, 150);

    doc.setFontSize(12);
    doc.setTextColor(26, 28, 44);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${booking.bookingRef}`, 30, 118);
    doc.text(booking.ticketType, 30, 138);
    doc.text(`${booking.quantity}`, 110, 138);
    doc.text(booking.paymentStatus, 30, 158);
    doc.setTextColor(45, 78, 200);
    doc.text(`$${booking.totalPrice.toFixed(2)}`, 110, 158);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing EventHub!', 105, 250, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 255, { align: 'center' });

    doc.save(`EventHub-Receipt-${booking.bookingRef}.pdf`);
};
