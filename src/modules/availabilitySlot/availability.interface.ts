export interface CreateAvailabilitySlotPayload {
  date: string;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilitySlotPayload {
  date?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
}
