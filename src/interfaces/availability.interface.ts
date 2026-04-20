export interface CreateAvailabilitySlotPayload {
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
}

export interface UpdateAvailabilitySlotPayload {
  date?: string;
  startTime?: string;
  endTime?: string;
  isBooked?: boolean;
  maxCapacity?: number;
}
