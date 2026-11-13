"use client";

import React, { useState } from "react";
import { ReservationRecord } from "@/services/api";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Calendar, Phone, MessageSquare, Check, X, Clock, Users } from "lucide-react";

interface ReservationsTabProps {
  reservations: ReservationRecord[];
  onUpdateStatus: (id: string, status: ReservationRecord["status"]) => Promise<void>;
  isLoading: boolean;
}

export function ReservationsTab({ reservations, onUpdateStatus }: ReservationsTabProps) {
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatus = async (id: string, status: ReservationRecord["status"]) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reservations.filter((r) => (filter === "all" ? true : r.status === filter));

  const statusBadge = (st: ReservationRecord["status"]) => {
    switch (st) {
      case "confirmed":
        return <Badge variant="success" dot>Confirmed</Badge>;
      case "completed":
        return <Badge variant="sand">Completed</Badge>;
      case "cancelled":
        return <Badge variant="danger" dot>Cancelled</Badge>;
      default:
        return <Badge>{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl text-charcoal-900">Dawat &amp; Table Reservations</h2>
            <Badge variant="saffron">{reservations.length} Bookings</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5">
            Manage air-conditioned family cabins, rooftop koyla lawn and shahi takht seating.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {["all", "confirmed", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-all cursor-pointer ${
                filter === st
                  ? "bg-charcoal-900 text-white shadow"
                  : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
              }`}
            >
              {st} ({st === "all" ? reservations.length : reservations.filter((r) => r.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-charcoal-700/40 mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">No reservations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res) => {
            const cleanPhone = res.phone.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : cleanPhone}?text=Assalam-o-Alaikum%20${encodeURIComponent(res.name)},%20your%20Dawat%20reservation%20(${res.id})%20at%20Pehalwan%20Karahi%20is%20ready!`;

            return (
              <div
                key={res.id}
                className="bg-sand-50 border border-sand-200 rounded-3xl p-5 shadow-soft flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm text-charcoal-900">{res.id}</span>
                    {statusBadge(res.status)}
                  </div>

                  {/* Guest Info */}
                  <div>
                    <h3 className="font-display font-bold text-base text-charcoal-900">{res.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-charcoal-700/80">
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-terracotta-500" />
                        {res.guests}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-charcoal-700/80">
                      <Clock className="w-3.5 h-3.5 text-saffron-500" />
                      <span className="font-semibold">{res.timeSlot}</span>
                    </div>
                  </div>

                  {/* Contact Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-sand-200 text-xs">
                    <a
                      href={`tel:${res.phone}`}
                      className="flex-1 bg-sand-100 hover:bg-sand-200 p-2 rounded-xl text-center font-bold text-charcoal-900 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{res.phone}</span>
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl font-bold flex items-center justify-center gap-1 px-3 transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="mt-4 pt-3 border-t border-sand-200/80 flex items-center justify-between gap-2">
                  {res.status === "confirmed" ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={updatingId === res.id}
                        onClick={() => handleStatus(res.id, "completed")}
                        className="text-[11px] py-1.5 flex-1"
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Mark Seated
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={updatingId === res.id}
                        onClick={() => handleStatus(res.id, "cancelled")}
                        className="text-[11px] py-1.5 text-red-600 hover:bg-red-50"
                        icon={<X className="w-3.5 h-3.5" />}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : res.status === "completed" ? (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Guests Completed Dawat
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={updatingId === res.id}
                      onClick={() => handleStatus(res.id, "confirmed")}
                      className="text-[11px] py-1.5 w-full"
                    >
                      Re-confirm Table
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
