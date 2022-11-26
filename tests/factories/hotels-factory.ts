import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business()
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.address.cityName(),
      capacity: Number(faker.random.numeric()),
      hotelId: hotelId
    }
  });
}
