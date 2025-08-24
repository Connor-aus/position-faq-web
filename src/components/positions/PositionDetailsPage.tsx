import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PositionDetails, getPositionDetails, updatePositionDetails } from '../../services/api';
import CandidateView from './CandidateView';

const PositionDetailsPage: React.FC = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const [positionDetails, setPositionDetails] = useState<PositionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSections, setEditingSections] = useState<{
    positionInfo: boolean;
    positionDetails: boolean;
    faqs: boolean;
  }>({
    positionInfo: false,
    positionDetails: false,
    faqs: false
  });
  const [enableAIChatbot, setEnableAIChatbot] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'employer' | 'candidate'>('employer');

  // Helper function to filter and keep only the latest version of each item
  const filterLatestVersions = (items: any[]) => {
    const latestVersions = new Map();
    
    // Group items by their ID and keep the one with the highest version
    items.forEach(item => {
      const id = item.id;
      if (!latestVersions.has(id) || latestVersions.get(id).version < item.version) {
        latestVersions.set(id, item);
      }
    });
    
    // Convert map values back to array
    return Array.from(latestVersions.values());
  };

  useEffect(() => {
    const fetchPositionDetails = async () => {
      if (!positionId) return;
      
      try {
        setLoading(true);
        const details = await getPositionDetails(parseInt(positionId, 10));
        
        // Filter position info and FAQs to only include the latest version of each item
        const filteredDetails = {
          ...details,
          positionInfo: filterLatestVersions(details.positionInfo),
          positionFAQs: filterLatestVersions(details.positionFAQs)
        };
        
        setPositionDetails(filteredDetails);
        
        // Set AI chatbot setting if it exists in the response, otherwise default to false
        if (details.hasOwnProperty('enableAIChatbot')) {
          setEnableAIChatbot(!!details.enableAIChatbot);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load position details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPositionDetails();
  }, [positionId]);

  const handleBackToJobs = () => {
    navigate('/');
  };

  const handleEditToggle = (section: 'positionInfo' | 'positionDetails' | 'faqs') => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    if (!positionDetails || !positionId) return;
    
    try {
      // Include the AI chatbot setting in the update
      const updatedData = {
        ...positionDetails,
        enableAIChatbot // Add the AI chatbot setting
      };
      
      await updatePositionDetails(parseInt(positionId, 10), updatedData);
      
      // Reset all editing states
      setEditingSections({
        positionInfo: false,
        positionDetails: false,
        faqs: false
      });
      
      // Refresh data
      const updatedDetails = await getPositionDetails(parseInt(positionId, 10));
      setPositionDetails(updatedDetails);
    } catch (err) {
      setError('Failed to update position details');
      console.error(err);
    }
  };
  
  // Helper function to check if any section is being edited
  const isAnySectionEditing = () => {
    return Object.values(editingSections).some(value => value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center">Loading position details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !positionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center text-red-600">{error || 'Position not found'}</p>
            <button 
              onClick={handleBackToJobs}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { position, positionFAQs, positionInfo } = positionDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Position Details</h1>
          
          {/* View Toggle Tabs */}
          <div className="flex border-b border-gray-200 mt-4">
            <button
              onClick={() => setActiveView('employer')}
              className={`py-2 px-4 font-medium text-sm ${activeView === 'employer' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Employer View
            </button>
            <button
              onClick={() => setActiveView('candidate')}
              className={`py-2 px-4 font-medium text-sm ${activeView === 'candidate' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Candidate View
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button 
            onClick={handleBackToJobs}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            &larr; Back to Jobs
          </button>
        </div>
        
        {/* Conditional rendering based on active view */}
        {activeView === 'candidate' && positionDetails ? (
          <CandidateView positionDetails={positionDetails} />
        ) : (
          <>
        {/* Save/Cancel controls - only shown when any section is being edited */}
        {isAnySectionEditing() && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-end">
            <div className="space-x-2">
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setEditingSections({
                  positionInfo: false,
                  positionDetails: false,
                  faqs: false
                })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Information Visible to Candidates */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold">Information Visible to Candidates</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Position Information</h3>
              <button 
                onClick={() => handleEditToggle('positionInfo')}
                className="text-gray-500 hover:text-blue-600"
                title="Edit Position Information"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Title</h3>
                {editingSections.positionInfo ? (
                  <input 
                    type="text" 
                    value={position.positionTitle}
                    onChange={(e) => setPositionDetails({
                      ...positionDetails,
                      position: {
                        ...position,
                        positionTitle: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p className="text-gray-800">{position.positionTitle}</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Version</h3>
                <p className="text-gray-800">{position.version}</p>
                <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(position.timestamp).toLocaleString()} (Version {position.version})</p>
              </div>
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                {editingSections.positionInfo ? (
                  <textarea 
                    value={position.positionDescription}
                    onChange={(e) => setPositionDetails({
                      ...positionDetails,
                      position: {
                        ...position,
                        positionDescription: e.target.value
                      }
                    })}
                    rows={4}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p className="text-gray-800 whitespace-pre-line">{position.positionDescription}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Information for AI Chatbot */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4 border-b pb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Information for AI Chatbot</h2>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  <input
                    id="enableAIChatbot"
                    type="checkbox"
                    checked={enableAIChatbot}
                    onChange={(e) => setEnableAIChatbot(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableAIChatbot" className="ml-2 block text-sm text-gray-900">
                    Enable AI Chatbot
                  </label>
                </div>
                <div className="relative inline-block">
                  <button 
                    className="text-gray-400 hover:text-gray-600 focus:outline-none peer" 
                    aria-label="Information"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="hidden peer-hover:block absolute right-0 w-72 bg-white border border-gray-200 p-3 rounded-lg shadow-lg z-10">
                    <p className="text-sm text-gray-600">
                      The AI Chatbot can answer candidate questions using the information provided here. A list of all common questions that the AI in unable to answer will be displayed here for you to address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Position Details Section */}
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Position Details</h3>
              <div className="flex items-center space-x-2">
                {editingSections.positionDetails && (
                  <button 
                    onClick={() => {
                      const newInfo = {
                        id: Date.now(), // Temporary ID for new items
                        positionId: parseInt(positionId!, 10),
                        generatedByUser: true,
                        answeredByHR: false,
                        subject: '',
                        answer: '',
                        version: 1,
                        timestamp: new Date().toISOString()
                      };
                      setPositionDetails({
                        ...positionDetails!,
                        positionInfo: [...positionDetails!.positionInfo, newInfo]
                      });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add New Detail
                  </button>
                )}
                <button 
                  onClick={() => handleEditToggle('positionDetails')}
                  className="text-gray-500 hover:text-blue-600"
                  title="Edit Position Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {positionInfo.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No position details available</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {positionInfo.map((info, index) => (
                  <div key={`${info.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <div className="w-full">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          {editingSections.positionDetails ? (
                            <input 
                              type="text" 
                              value={info.subject}
                              onChange={(e) => {
                                const updatedInfo = [...positionDetails!.positionInfo];
                                updatedInfo[index] = { ...info, subject: e.target.value };
                                setPositionDetails({ ...positionDetails!, positionInfo: updatedInfo });
                              }}
                              className="w-full p-2 border rounded"
                            />
                          ) : (
                            <p className="text-gray-800 font-semibold">{info.subject}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                          {editingSections.positionDetails ? (
                            <textarea 
                              value={info.answer || ''}
                              onChange={(e) => {
                                const updatedInfo = [...positionDetails!.positionInfo];
                                updatedInfo[index] = { ...info, answer: e.target.value };
                                setPositionDetails({ ...positionDetails!, positionInfo: updatedInfo });
                              }}
                              rows={3}
                              className="w-full p-2 border rounded"
                            />
                          ) : (
                            <p className="text-gray-800">{info.answer || 'Not answered yet'}</p>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                          <div></div>
                          <span>Last updated: {new Date(info.timestamp).toLocaleString()} (Version {info.version})</span>
                        </div>
                      </div>
                      {editingSections.positionDetails && (
                        <div className="ml-4">
                          <button 
                            onClick={() => {
                              const updatedInfo = positionDetails!.positionInfo.filter((_, i) => i !== index);
                              setPositionDetails({ ...positionDetails!, positionInfo: updatedInfo });
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
              <div className="flex items-center space-x-2">
                {editingSections.faqs && (
                  <button 
                    onClick={() => {
                      const newFAQ = {
                        id: Date.now(), // Temporary ID for new items
                        positionId: parseInt(positionId!, 10),
                        generatedByUser: true,
                        answeredByHR: false,
                        timesAsked: 1,
                        question: '',
                        response: null,
                        version: 1,
                        timestamp: new Date().toISOString()
                      };
                      setPositionDetails({
                        ...positionDetails!,
                        positionFAQs: [...positionDetails!.positionFAQs, newFAQ]
                      });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add New FAQ
                  </button>
                )}
                <button 
                  onClick={() => handleEditToggle('faqs')}
                  className="text-gray-500 hover:text-blue-600"
                  title="Edit FAQs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {positionFAQs.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No FAQs available</div>
            ) : (
              <>
                {/* Answered FAQs */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Answered Questions</h4>
                  {positionFAQs.filter(faq => faq.answeredByHR).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No answered questions yet</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {positionFAQs
                        .filter(faq => faq.answeredByHR)
                        .map((faq, index) => (
                          <div key={`answered-${faq.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between">
                              <div className="w-full">
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                  {editingSections.faqs ? (
                                    <input 
                                      type="text" 
                                      value={faq.question}
                                      onChange={(e) => {
                                        const updatedFAQs = [...positionDetails!.positionFAQs];
                                        const originalIndex = positionFAQs.findIndex(item => item.id === faq.id);
                                        updatedFAQs[originalIndex] = { ...faq, question: e.target.value };
                                        setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                      }}
                                      className="w-full p-2 border rounded"
                                    />
                                  ) : (
                                    <p className="text-gray-800 font-semibold">{faq.question}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                  {editingSections.faqs ? (
                                    <textarea 
                                      value={faq.response || ''}
                                      onChange={(e) => {
                                        const updatedFAQs = [...positionDetails!.positionFAQs];
                                        const originalIndex = positionFAQs.findIndex(item => item.id === faq.id);
                                        updatedFAQs[originalIndex] = { ...faq, response: e.target.value };
                                        setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                      }}
                                      rows={3}
                                      className="w-full p-2 border rounded"
                                    />
                                  ) : (
                                    <p className="text-gray-800">{faq.response || 'Not answered yet'}</p>
                                  )}
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                  <div>
                                    <span>Times Asked: {faq.timesAsked}</span>
                                  </div>
                                  <span>Last updated: {new Date(faq.timestamp).toLocaleString()} (Version {faq.version})</span>
                                </div>
                                <div className="mt-1 text-xs">
                                  {faq.generatedByUser && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">User Generated</span>}
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Answered</span>
                                </div>
                              </div>
                              {editingSections.faqs && (
                                <div className="ml-4">
                                  <button 
                                    onClick={() => {
                                      const updatedFAQs = positionDetails!.positionFAQs.filter(item => item.id !== faq.id);
                                      setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Unanswered FAQs */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Unanswered Questions</h4>
                  {positionFAQs.filter(faq => !faq.answeredByHR).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">No unanswered questions</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {positionFAQs
                        .filter(faq => !faq.answeredByHR)
                        .map((faq, index) => (
                          <div key={`unanswered-${faq.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between">
                              <div className="w-full">
                                <div className="mb-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                  {editingSections.faqs ? (
                                    <input 
                                      type="text" 
                                      value={faq.question}
                                      onChange={(e) => {
                                        const updatedFAQs = [...positionDetails!.positionFAQs];
                                        const originalIndex = positionFAQs.findIndex(item => item.id === faq.id);
                                        updatedFAQs[originalIndex] = { ...faq, question: e.target.value };
                                        setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                      }}
                                      className="w-full p-2 border rounded"
                                    />
                                  ) : (
                                    <p className="text-gray-800 font-semibold">{faq.question}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                  {editingSections.faqs ? (
                                    <textarea 
                                      value={faq.response || ''}
                                      onChange={(e) => {
                                        const updatedFAQs = [...positionDetails!.positionFAQs];
                                        const originalIndex = positionFAQs.findIndex(item => item.id === faq.id);
                                        updatedFAQs[originalIndex] = { 
                                          ...faq, 
                                          response: e.target.value,
                                          answeredByHR: e.target.value.trim() !== '' // Automatically mark as answered if there's a response
                                        };
                                        setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                      }}
                                      rows={3}
                                      className="w-full p-2 border rounded"
                                    />
                                  ) : (
                                    <p className="text-gray-800">{faq.response || 'Not answered yet'}</p>
                                  )}
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                  <div>
                                    <span>Times Asked: {faq.timesAsked}</span>
                                  </div>
                                  <span>Last updated: {new Date(faq.timestamp).toLocaleString()} (Version {faq.version})</span>
                                </div>
                                <div className="mt-1 text-xs">
                                  {faq.generatedByUser && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">User Generated</span>}
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Unanswered</span>
                                </div>
                              </div>
                              {editingSections.faqs && (
                                <div className="ml-4">
                                  <button 
                                    onClick={() => {
                                      const updatedFAQs = positionDetails!.positionFAQs.filter(item => item.id !== faq.id);
                                      setPositionDetails({ ...positionDetails!, positionFAQs: updatedFAQs });
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PositionDetailsPage;
