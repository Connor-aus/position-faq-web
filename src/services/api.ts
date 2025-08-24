import axios from 'axios';
import logger from '../utils/logger';

// Define API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'API BASE URL NOT IMPLEMENTED';
const API_KEY = process.env.REACT_APP_API_KEY || 'API KEY NOT IMPLEMENTED';

// Define interfaces for API responses
export interface FAQ {
  id: number;
  positionId: number;
  generatedByUser: boolean;
  answeredByHR: boolean;
  timesAsked: number;
  question: string;
  response: string | null;
  version: number;
  timestamp: string;
}

export interface PositionInfo {
  id: number;
  positionId: number;
  generatedByUser: boolean;
  answeredByHR: boolean;
  subject: string;
  answer: string | null;
  version: number;
  timestamp: string;
}

export interface Position {
  id: number;
  companyId: number;
  positionTitle: string;
  positionDescription: string;
  version: number;
  timestamp: string;
}

export interface PositionDetails {
  position: Position;
  positionFAQs: FAQ[];
  positionInfo: PositionInfo[];
  enableAIChatbot?: boolean; // Optional property for AI chatbot setting
}

export interface PositionsResponse {
  positions: PositionDetails[];
}

// Define Job interface for display in the jobs list
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

// Get all jobs for a company
export const getAllJobs = async (companyId: number) => {
  try {
    const response = await apiClient.get(`/v1/company/${companyId}/positions`);
    const positionsResponse = response.data as PositionsResponse;
    
    // Transform positions data into Job format for display
    const jobs: Job[] = positionsResponse.positions.map(positionDetail => ({
      id: positionDetail.position.id,
      title: positionDetail.position.positionTitle,
      // These fields aren't in the API response, so we're using placeholders
      location: 'Various',
      status: 'OPEN',
      newCandidates: 0,
      totalCandidates: 0,
      createdOn: new Date(positionDetail.position.timestamp).toLocaleDateString()
    }));
    
    return jobs;
  } catch (error) {
    logger.error('Error getting company jobs: ', error);
    throw error;
  }
};

// Interface for position versions response
export interface PositionVersionsResponse {
  versions: PositionDetails[];
}

// Get detailed position data by positionId
export const getPositionDetails = async (positionId: number) => {
  try {
    // For demo purposes, use mock data from the example file
    // In a real app, this would be: const response = await apiClient.get(`/v1/position/${positionId}/versions`);
    
    // Mock response for development
    const mockData = {
      "versions": [
        {
          "position": {
            "id": 1001,
            "companyId": 2001,
            "positionTitle": "Senior Full Stack Engineer (Payments)",
            "positionDescription": "Senior Full Stack Engineer (Payments). Brisbane (Hybrid). Own key features across React + Node/AWS stack. Collaborate with Product and Design. On-call rotation optional.",
            "version": 1,
            "timestamp": "2025-08-24T15:05:00+10:00"
          },
          "positionFAQs": [
            {
              "id": 50001,
              "positionId": 1001,
              "generatedByUser": false,
              "answeredByHR": true,
              "timesAsked": 1,
              "question": "Is this role hybrid or fully on-site?",
              "response": "Hybrid: 2 days in-office (Tue/Thu), flexible start 7-10am.",
              "version": 1,
              "timestamp": "2025-08-24T12:10:00+10:00"
            },
            {
              "id": 50002,
              "positionId": 1001,
              "generatedByUser": true,
              "answeredByHR": false,
              "timesAsked": 1,
              "question": "Is parking provided for this role's office?",
              "response": null,
              "version": 1,
              "timestamp": "2025-08-24T12:42:00+10:00"
            },
            {
              "id": 50003,
              "positionId": 1001,
              "generatedByUser": true,
              "answeredByHR": true,
              "timesAsked": 1,
              "question": "What does the interview process look like?",
              "response": "30-min recruiter screen → 60-min tech interview → 60-min system design → final values interview.",
              "version": 2,
              "timestamp": "2025-08-24T13:30:00+10:00"
            },
            {
              "id": 50004,
              "positionId": 1001,
              "generatedByUser": true,
              "answeredByHR": false,
              "timesAsked": 1,
              "question": "Do you offer a relocation allowance?",
              "response": null,
              "version": 1,
              "timestamp": "2025-08-24T14:15:00+10:00"
            }
          ],
          "positionInfo": [
            {
              "id": 60001,
              "positionId": 1001,
              "generatedByUser": false,
              "answeredByHR": true,
              "subject": "Team size",
              "answer": "8 engineers (2 seniors, 4 mids, 2 juniors) + 1 EM + 1 PM.",
              "version": 1,
              "timestamp": "2025-08-24T11:55:00+10:00"
            },
            {
              "id": 60002,
              "positionId": 1001,
              "generatedByUser": false,
              "answeredByHR": true,
              "subject": "Tech stack",
              "answer": "React, TypeScript, Node.js, AWS (Lambda, API Gateway, DynamoDB), Terraform, GitHub Actions.",
              "version": 1,
              "timestamp": "2025-08-24T11:56:00+10:00"
            },
            {
              "id": 60003,
              "positionId": 1001,
              "generatedByUser": true,
              "answeredByHR": false,
              "subject": "Travel expectations",
              "answer": null,
              "version": 1,
              "timestamp": "2025-08-24T13:05:00+10:00"
            },
            {
              "id": 60002,
              "positionId": 1001,
              "generatedByUser": false,
              "answeredByHR": true,
              "subject": "Tech stack",
              "answer": "React, JavaScript, Node.js, AWS (Lambda, API Gateway, DynamoDB), Terraform, GitHub Actions.",
              "version": 2,
              "timestamp": "2025-08-24T14:05:00+10:00"
            },
            {
              "id": 60005,
              "positionId": 1001,
              "generatedByUser": true,
              "answeredByHR": true,
              "subject": "Salary",
              "answer": "Unknown at this stage.",
              "version": 1,
              "timestamp": "2025-08-24T14:05:00+10:00"
            }
          ]
        }
      ]
    };

    // Use the first version from the versions array
    const versionsResponse = mockData as PositionVersionsResponse;
    
    // Find the position with matching ID or use the first one as fallback
    const positionDetail = versionsResponse.versions.find(v => v.position.id === positionId) || versionsResponse.versions[0];
    
    return positionDetail;
  } catch (error) {
    logger.error('Error getting position details: ', error);
    throw error;
  }
};

// Update position details
export const updatePositionDetails = async (positionId: number, updatedDetails: Partial<PositionDetails>) => {
  try {
    const response = await apiClient.put(`/v1/position/${positionId}/details`, updatedDetails);
    
    logger.info('Updating position details:', { positionId, updatedDetails });
    
    // Mock successful response
    return {
      success: true,
      message: 'Position details updated successfully',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error updating position details: ', error);
    throw error;
  }
};

export default apiClient;
