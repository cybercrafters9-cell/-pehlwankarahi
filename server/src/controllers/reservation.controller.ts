import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, Reservation } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const createReservation = (
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  try {
    const { name, phone, guests, timeSlot } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: "Name and Phone number are required to book your Dawat.",
      });
    }

    const reservation = db.createReservation({
      name: name.trim(),
      phone: phone.trim(),
      guests: guests || "5-8 Guests (Rooftop Koyla Lawn)",
      timeSlot: timeSlot || "Tonight — 9:30 PM (Peak BBQ)",
    });

    res.status(201).json({
      success: true,
      message: `Table reserved successfully! Booking reference: ${reservation.id}`,
      data: reservation,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to reserve table"),
    });
  }
};

export const getReservations = (
  req: Request,
  res: Response<ApiResponse<Reservation[]>>
) => {
  try {
    const reservations = db.getReservations();
    res.json({
      success: true,
      message: `Retrieved ${reservations.length} reservations`,
      data: reservations,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to retrieve reservations"),
    });
  }
};

export const getReservationById = (
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  try {
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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Error fetching booking details"),
    });
  }
};

export const updateReservationStatus = (
  req: Request,
  res: Response<ApiResponse<Reservation>>
) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const validStatuses = ["confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to update reservation"),
    });
  }
};
