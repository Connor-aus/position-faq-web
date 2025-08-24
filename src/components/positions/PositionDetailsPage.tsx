import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PositionDetails, getPositionDetails, updatePositionDetails } from '../../services/api';

const PositionDetailsPage: React.FC = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const navigate = useNavigate();
  const [positionDetails, setPositionDetails] = useState<PositionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!positionDetails || !positionId) return;
    
    try {
      await updatePositionDetails(parseInt(positionId, 10), positionDetails);
      setIsEditing(false);
      // Refresh data
      const updatedDetails = await getPositionDetails(parseInt(positionId, 10));
      setPositionDetails(updatedDetails);
    } catch (err) {
      setError('Failed to update position details');
      console.error(err);
    }
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Position Information</h2>
            <div>
              {isEditing ? (
                <div className="space-x-2">
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Details
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Title</h3>
              {isEditing ? (
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
              <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(position.timestamp).toLocaleString()}</p>
            </div>
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              {isEditing ? (
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Position Details</h2>
            {isEditing && (
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
                        {isEditing ? (
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
                        {isEditing ? (
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
                        <span>Version: {info.version}</span>
                        <span>Last updated: {new Date(info.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    {isEditing && (
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            {isEditing && (
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
          </div>
          
          {positionFAQs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No FAQs available</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {positionFAQs.map((faq, index) => (
                <div key={`${faq.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div className="w-full">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={faq.question}
                            onChange={(e) => {
                              const updatedFAQs = [...positionDetails!.positionFAQs];
                              updatedFAQs[index] = { ...faq, question: e.target.value };
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
                        {isEditing ? (
                          <textarea 
                            value={faq.response || ''}
                            onChange={(e) => {
                              const updatedFAQs = [...positionDetails!.positionFAQs];
                              updatedFAQs[index] = { ...faq, response: e.target.value };
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
                          <span>Version: {faq.version}</span>
                          <span className="ml-4">Times Asked: {faq.timesAsked}</span>
                        </div>
                        <span>Last updated: {new Date(faq.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 text-xs">
                        {faq.generatedByUser && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">User Generated</span>}
                        {faq.answeredByHR && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">HR Answered</span>}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="ml-4">
                        <button 
                          onClick={() => {
                            const updatedFAQs = positionDetails!.positionFAQs.filter((_, i) => i !== index);
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
      </div>
    </div>
  );
};

export default PositionDetailsPage;
