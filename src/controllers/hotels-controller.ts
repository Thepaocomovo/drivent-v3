import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotelsList = await hotelService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotelsList);
  } catch (error) {
    if (error.name === "PaymentRequired") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const id = req.params.hotelId;
  const hotelId = Number(id);

  if (isNaN(hotelId)) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const hotelsList = await hotelService.getHotelsRooms(userId, hotelId);
    if (hotelsList.length === 0) {
      res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.status(httpStatus.OK).send(hotelsList);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
