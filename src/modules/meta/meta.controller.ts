import { Request, Response } from "express";
import { MetaService } from "./meta.service";

const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await MetaService.getPlatformStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const MetaController = {
  getStats,
};
