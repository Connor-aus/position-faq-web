import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Job, getAllJobs } from '../../services/api';

interface JobsPageProps {
  companyId: number;
}

const JobsPage: React.FC<JobsPageProps> = ({ companyId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Jobs');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await getAllJobs(companyId);
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [companyId]);

  const tabs = ['Jobs', 'Candidates', 'Hiring Processes', 'Job Boards', 'Talent Pool', 'Reports'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Recruitment</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Jobs Content */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Jobs</h2>

        {/* Add New Job Button */}
        <div className="mb-6">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center">
            <span>Add new job</span>
            <span className="ml-1">▼</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center">
          <span className="mr-2">Filter by</span>
          <div className="flex space-x-2">
            <button className="border border-gray-300 rounded px-3 py-1 flex items-center">
              <span>Status</span>
              <span className="ml-2">▼</span>
            </button>
            <button className="border border-gray-300 rounded px-3 py-1 flex items-center">
              <span>Teams</span>
              <span className="ml-2">▼</span>
            </button>
            <button className="border border-gray-300 rounded px-3 py-1 flex items-center">
              <span>Country</span>
              <span className="ml-2">▼</span>
            </button>
            <button className="border border-gray-300 rounded px-3 py-1 flex items-center">
              <span>Location</span>
              <span className="ml-2">▼</span>
            </button>
            <button className="border border-gray-300 rounded px-3 py-1 flex items-center">
              <span>More</span>
              <span className="ml-2">▼</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="mb-6 flex items-center space-x-2">
          <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
            <span>Status: Open</span>
            <button className="ml-2">×</button>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
            <span>Country: All</span>
            <button className="ml-2">×</button>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
            <span>Type: All</span>
            <button className="ml-2">×</button>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
            <span>Teams: All</span>
            <button className="ml-2">×</button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 bg-gray-100 p-4 border-b">
            <div className="font-medium">Job title</div>
            <div className="font-medium">New candidates</div>
            <div className="font-medium">Total candidates</div>
            <div className="font-medium">Location</div>
            <div className="font-medium">Status</div>
            <div className="font-medium">Created on</div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="p-4 text-center">Loading jobs...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="p-4 text-center">No jobs found</div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="grid grid-cols-6 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600">
                  <Link to={`/position/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </div>
                <div>{job.newCandidates}</div>
                <div>{job.totalCandidates}</div>
                <div>{job.location}</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {job.status}
                  </span>
                </div>
                <div>{job.createdOn}</div>
              </div>
            ))
          )}

          {/* Sample Jobs (for demo) */}
          {jobs.length === 0 && !loading && !error && (
            <>
              <div className="grid grid-cols-6 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600">
                  <Link to="/position/1001" className="hover:underline">
                    IT Trainer - Remote
                  </Link>
                </div>
                <div>5</div>
                <div>10</div>
                <div>Glebe</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    OPEN
                  </span>
                </div>
                <div>19/07/2024</div>
              </div>
              <div className="grid grid-cols-6 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600">
                  <Link to="/position/1002" className="hover:underline">
                    Account Coordinator - Remote
                  </Link>
                </div>
                <div>0</div>
                <div>0</div>
                <div>North Sydney</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    OPEN
                  </span>
                </div>
                <div>19/07/2024</div>
              </div>
              <div className="grid grid-cols-6 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600">
                  <Link to="/position/1003" className="hover:underline">
                    [TEST] Digital Marketing Coordinator - Remote
                  </Link>
                </div>
                <div>13</div>
                <div>16</div>
                <div>Glebe</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    OPEN
                  </span>
                </div>
                <div>12/07/2024</div>
              </div>
              <div className="grid grid-cols-6 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600">
                  <Link to="/position/1004" className="hover:underline">
                    Barista
                  </Link>
                </div>
                <div>65</div>
                <div>65</div>
                <div>Central London</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    OPEN
                  </span>
                </div>
                <div>11/07/2024</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
