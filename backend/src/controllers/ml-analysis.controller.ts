import { Request, Response } from 'express';
import { mlAnalysisService } from '../services/ml-analysis.service';

export const predictProjectCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData = req.body;
    const prediction = await mlAnalysisService.predictProjectCost(projectData);

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to predict project cost',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const predictProjectDuration = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData = req.body;
    const prediction = await mlAnalysisService.predictProjectDuration(projectData);

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to predict project duration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const segmentCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const segments = await mlAnalysisService.segmentCustomers();

    res.status(200).json({
      success: true,
      data: segments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to segment customers',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const predictEmployeeTurnover = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeData = req.body;
    const prediction = await mlAnalysisService.predictEmployeeTurnover(employeeData);

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to predict employee turnover',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const optimizeInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const materialData = req.body;
    const optimization = await mlAnalysisService.optimizeInventory(materialData);

    res.status(200).json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to optimize inventory',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMLServiceHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const health = await mlAnalysisService.healthCheck();

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check ML service health',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
