import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findHotelRooms(hotelId: number) {
  return prisma.hotel.findMany({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });
}

const hotelsRepository = {
  findHotels,
  findHotelRooms
};

export default hotelsRepository;
