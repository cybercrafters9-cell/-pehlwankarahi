import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, Reservation } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const createReservation = asyncHandler((
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  const { name, phone, guests, timeSlot } = req.body;

  const reservation = db.createReservation({
    name,
    phone,
    guests: guests || "5-8 Guests (Rooftop Koyla Lawn)",
    timeSlot: timeSlot || "Tonight — 9:30 PM (Peak BBQ)",
  });

  res.status(201).json({
    success: true,
    message: `Table reserved successfully! Booking reference: ${reservation.id}`,
    data: reservation,
  });
});

export const getReservations = asyncHandler((
  req: Request,
  res: Response<ApiResponse<Reservation[]>>
) => {
  const reservations = db.getReservations();
  res.json({
    success: true,
    message: `Retrieved ${reservations.length} reservations`,
    data: reservations,
  });
});

export const getReservationById = asyncHandler((
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  const id = String(req.params.id);
  const reservation = db.getReservationById(id);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      error: `Booking ${id} not found`,
    });
  }

  res.json({
    success: true,
    data: reservation,
  });
});

export const updateReservationStatus = asyncHandler((
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const updated = db.updateReservationStatus(id, status);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: `Booking ${id} not found`,
    });
  }

  res.json({
    success: true,
    message: `Reservation ${id} updated to ${status}`,
    data: updated,
  });
});
