import { TutorSortableFields } from "../../types/types";

export interface TutorProfileData {
  bio?: string;
  hourlyRate: number;
  experience: number;
  categoryId: string;
}

export type GetAllTutorsParams = {
  search?: string;
  categoryId?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  minExperience?: number;
  availableDate?: string;
  page: number;
  limit: number;
  skip: number;
  sortBy: TutorSortableFields;
  sortOrder: "asc" | "desc";
};
