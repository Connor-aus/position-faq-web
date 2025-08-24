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
    logger.info('Sending chat request:', { question, positionId });
    
    // For development/testing: mock a successful response with a delay
    if (process.env.NODE_ENV === 'development') {
      logger.info('Using mock chat response in development mode');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock response based on the question
      const mockResponses = {
        salary: "The salary range for this position is competitive and depends on experience, typically ranging from $80,000 to $120,000 annually.",
        experience: "We're looking for candidates with at least 3-5 years of relevant experience in this field.",
        remote: "This position offers flexible work arrangements with 2-3 days of remote work per week.",
        benefits: "We offer comprehensive benefits including health insurance, 401(k) matching, generous PTO, and professional development opportunities.",
        interview: "The interview process consists of an initial phone screening, followed by a technical assessment and 1-2 rounds of team interviews.",
        default: "Thank you for your question about this position. Our team will review and provide more specific information soon."
      };
      
      // Check if the question contains keywords and return appropriate response
      const lowerQuestion = question.toLowerCase();
      if (lowerQuestion.includes('salary') || lowerQuestion.includes('pay') || lowerQuestion.includes('compensation')) {
        return { answer: mockResponses.salary };
      } else if (lowerQuestion.includes('experience') || lowerQuestion.includes('background') || lowerQuestion.includes('qualification')) {
        return { answer: mockResponses.experience };
      } else if (lowerQuestion.includes('remote') || lowerQuestion.includes('work from home') || lowerQuestion.includes('location')) {
        return { answer: mockResponses.remote };
      } else if (lowerQuestion.includes('benefits') || lowerQuestion.includes('perks') || lowerQuestion.includes('insurance')) {
        return { answer: mockResponses.benefits };
      } else if (lowerQuestion.includes('interview') || lowerQuestion.includes('process') || lowerQuestion.includes('hiring')) {
        return { answer: mockResponses.interview };
      } else {
        return { answer: mockResponses.default };
      }
    }
    
    // Actual API call for production
    const response = await apiClient.post('/v1/chatRequest', { 
      question, 
      positionId 
    });
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
export const getPositionDetails = async (positionId: number = 2001) => {
  try {
    // Always use position ID 2001 as hardcoded value
    const hardcodedPositionId = 1001;
    
    // Call the actual API endpoint
    const response = await apiClient.get(`/v1/position/${hardcodedPositionId}/versions`);
    const versionsResponse = response.data as PositionVersionsResponse;
    
    // Find the position with matching ID or use the first one as fallback
    const positionDetail = versionsResponse.versions.find(v => v.position.id === hardcodedPositionId) || versionsResponse.versions[0];
    
    return positionDetail;
  } catch (error) {
    logger.error('Error getting position details: ', error);
    throw error;
  }
};

// Update position details
export const updatePositionDetails = async (positionId: number, updatedDetails: Partial<PositionDetails>) => {
  try {
    // Make API call but don't use response directly as we're mocking the response
    await apiClient.put(`/v1/position/${positionId}/details`, updatedDetails);
    
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
