import React, { useState } from 'react';
import { PositionDetails, sendChatRequest } from '../../services/api';

interface CandidateViewProps {
  positionDetails: PositionDetails;
}

const CandidateView: React.FC<CandidateViewProps> = ({ positionDetails }) => {
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_QUESTION_LENGTH = 200;

  const { position, positionInfo } = positionDetails;

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    setChatResponse(null);
    
    try {
      const response = await sendChatRequest(question, position.id);
      setChatResponse(response.answer || 'Thank you for your question. We will get back to you shortly.');
    } catch (err) {
      setError('Sorry, we couldn\'t process your question at this time. Please try again later.');
      console.error('Chat request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Position Title and Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{position.positionTitle}</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{position.positionDescription}</p>
        </div>
      </div>
      
      {/* Position Information */}
      {positionInfo.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Position Details</h3>
          <div className="space-y-4">
            {positionInfo.map((info, index) => (
              <div key={`info-${info.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{info.subject}</h4>
                <p className="text-gray-700">{info.answer || 'Information not available'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chatbot */}
      <div className="bg-white rounded-lg shadow p-6 relative">
        <h3 className="text-xl font-bold mb-4">Ask About This Position</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={handleQuestionSubmit}>
            <div className="mb-4">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="What would you like to know about this position?"
                maxLength={MAX_QUESTION_LENGTH}
              />
              <div className="text-xs text-gray-500 text-right">
                {question.length}/{MAX_QUESTION_LENGTH} characters
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Question'}
              </button>
            </div>
          </form>
          
          {/* Response Area */}
          {loading && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <p className="text-gray-700">Processing your question...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {chatResponse && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Response:</h4>
              <p className="text-gray-700">{chatResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateView;
