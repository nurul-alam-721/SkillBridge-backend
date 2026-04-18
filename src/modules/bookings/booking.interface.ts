export interface CreateBookingPayload {
  tutorProfileId: string;
  slotId: string;
}

export type BookingUserRole = "STUDENT" | "TUTOR";
