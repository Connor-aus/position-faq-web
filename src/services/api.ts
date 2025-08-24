import axios from 'axios';
import logger from '../utils/logger';

// Define API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'API BASE URL NOT IMPLEMENTED';
const API_KEY = process.env.REACT_APP_API_KEY || 'API KEY NOT IMPLEMENTED';

// Define Job interface
export interface Job {
  id: number;
  title: string;
  location: string;
  status: string;
  newCandidates: number;
  totalCandidates: number;
  createdOn: string;
  remote?: boolean;
}

logger.info('API_BASE_URL', API_BASE_URL);

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY || '',
  },
});

// Add logging for all requests
apiClient.interceptors.request.use(
  (config) => {
    logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('API Request Error: ', error);
    return Promise.reject(error);
  }
);

// Add logging for all responses
apiClient.interceptors.response.use(
  (response) => {
    logger.info(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('API Response Error: ', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Send chat request with question and positionId
export const sendChatRequest = async (question: string, positionId: number) => {
  try {
    const response = await apiClient.post('/v1/chatrequest', { question, positionId });
    return response.data;
  } catch (error) {
    logger.error('Error sending chat request: ', error);
    throw error;
  }
};

// Get position data by positionId
export const getPositionData = async (positionId: number) => {
  try {
    const response = await apiClient.get(`/v1/position/${positionId}`);
    return response.data;
  } catch (error) {
    logger.error('Error getting position data: ', error);
    throw error;
  }
};

// Get positions data by companyId
export const getCompanyPositions = async (companyId: number) => {
  try {
    const response = await apiClient.get(`/v1/company/${companyId}/positions`);
    return response.data;
  } catch (error) {
    logger.error('Error getting company positions: ', error);
    throw error;
  }
};

// Update or create position data
export const updatePositionData = async (positionId: number, positionData: any) => {
  try {
    const response = await apiClient.put(`/v1/position/${positionId}`, positionData);
    return response.data;
  } catch (error) {
    logger.error('Error updating position data: ', error);
    throw error;
  }
};

// Get all jobs for a company
export const getAllJobs = async (companyId: number) => {
  try {
    const response = await apiClient.get(`/v1/company/${companyId}/jobs`);
    return response.data as Job[];
  } catch (error) {
    logger.error('Error getting company jobs: ', error);
    throw error;
  }
};

export default apiClient;
