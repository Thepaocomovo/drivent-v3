import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import { paymentRequiredError } from "@/errors/payment-required-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError();
  }

  if(ticket.status !== "PAID") {
    throw paymentRequiredError();
  }

  if (ticket.TicketType.includesHotel !== true || ticket.TicketType.isRemote !== false) {
    throw forbiddenError();
  }

  const hotelsList = await hotelsRepository.findHotels();
  if (!hotelsList) {
    throw notFoundError();
  }
  if (hotelsList.length === 0) {
    return [];
  }
  return hotelsList;
}

async function getHotelsRooms(userId: number, hotelId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const hotelsList = await hotelsRepository.findHotelRooms(hotelId);
  if (!hotelsList) {
    throw notFoundError();
  }
  if (hotelsList.length === 0) {
    return [];
  }
  return hotelsList;
}

const hotelsService = {
  getHotels,
  getHotelsRooms
};

export default hotelsService;
