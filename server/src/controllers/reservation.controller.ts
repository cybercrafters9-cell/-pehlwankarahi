import { Request, Response } from "express";
import { reservationRepository } from "../repositories/reservation.repository";
import { ApiResponse, Reservation } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const createReservation = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Reservation>>) => {
    const { name, phone, guests, timeSlot } = req.body;

    const reservation = await reservationRepository.create({
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
  }
);

export const getReservations = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Reservation[]>>) => {
    const reservations = await reservationRepository.getAll();
    res.json({
      success: true,
      message: `Retrieved ${reservations.length} reservations`,
      data: reservations,
    });
  }
);

export const getReservationById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Reservation>>) => {
    const id = String(req.params.id);
    const reservation = await reservationRepository.getById(id);

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
  }
);

export const updateReservationStatus = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Reservation>>) => {
    const id = String(req.params.id);
    const { status } = req.body;

    const updated = await reservationRepository.updateStatus(id, status);
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
  }
);
