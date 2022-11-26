import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketTypeNoRemoteWhithHotel,
  createTicket,
  createHotel,
  createRoom,
  createTicketType
} from "../factories";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 when user doesn't have an enrollment yet", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should respond  with status 402 when tyketStatus is not 'PAID'", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoRemoteWhithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond  with status 403 when includesHotel if false", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond  with status 200 and with empty array when there are no hotels created", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoRemoteWhithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual([]);
  });

  it("should respond with status 200 and with existing hotel data", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoRemoteWhithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString()
        })
      ])
    );
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 when user doesn't have an enrollment yet", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get("/tickets").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should respond with status 400 when /:hotelId params is not a number", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    const hotel = await createHotel();
    await createRoom(hotel.id);

    const response = await server.get("/hotels/a").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when /:hotelId params is not a valid hotel id", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    const hotel = await createHotel();
    await createRoom(hotel.id);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 200 and with hotel and rooms data", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: expect.arrayContaining([
            expect.objectContaining({
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              hotelId: hotel.id,
              createdAt: room.createdAt.toISOString(),
              updatedAt: room.updatedAt.toISOString()
            })
          ])
        })
      ])
    );
  });
});
