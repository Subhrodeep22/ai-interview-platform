'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type JobStatus = 'DRAFT' | 'ONGOING' | 'CLOSED';
type JobVisibility = 'PUBLIC' | 'PRIVATE';

type Job = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  salaryRange?: string | null;
  requirements: string[];
  visibility: JobVisibility;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

interface JobFormState {
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  requirements: string;
  visibility: JobVisibility;
}

const initialForm: JobFormState = {
  title: '',
  description: '',
  location: '',
  salaryRange: '',
  requirements: '',
  visibility: 'PUBLIC',
};

const statusStyles: Record<JobStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  ONGOING: 'bg-green-100 text-green-700 border border-green-200',
  CLOSED: 'bg-red-100 text-red-700 border border-red-200',
};

const statusLabels: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  ONGOING: 'Live',
  CLOSED: 'Closed',
};

const visibilityLabels: Record<JobVisibility, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
};

export default function JobsPage() {
  const { user } = useAuthStore();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formState, setFormState] = useState<JobFormState>(initialForm);

  const isRecruiter = useMemo(() => user?.role === 'RECRUITER', [user?.role]);

  useEffect(() => {
    if (!user) return;

    if (!isRecruiter) {
      setError('Only recruiters can manage job postings.');
      setIsLoading(false);
      return;
    }

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isRecruiter]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/api/recruiter/jobs');
      setJobs(response.data.jobs || []);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load job postings.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formState.title.trim() || !formState.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    const requirements = formState.requirements
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        location: formState.location.trim() || undefined,
        salaryRange: formState.salaryRange.trim() || undefined,
        requirements,
        visibility: formState.visibility,
      };

      const response = await api.post('/api/recruiter/jobs/create', payload);
      const newJob: Job = response.data.job;
      setJobs((prev) => [newJob, ...prev]);
      setFormState(initialForm);
      setSuccess('Job created successfully and saved as draft.');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to create job.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    setError('');
    setSuccess('');
    setActionLoading(jobId);

    try {
      const response = await api.patch(`/api/recruiter/jobs/${jobId}/status`, { status });
      const updatedJob: Job = response.data.job;

      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: updatedJob.status } : job)));
      setSuccess(`Job status updated to ${statusLabels[updatedJob.status]}.`);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to update job status.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (!confirm(`Delete job “${job.title}”? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');
    setActionLoading(jobId);

    try {
      await api.delete(`/api/recruiter/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setSuccess('Job deleted successfully.');
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to delete job.';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusActionButtons = (job: Job) => {
    if (job.status === 'DRAFT') {
      return (
        <button
          onClick={() => handleStatusChange(job.id, 'ONGOING')}
          disabled={actionLoading === job.id}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-60"
        >
          {actionLoading === job.id ? 'Publishing…' : 'Publish'}
        </button>
      );
    }

    if (job.status === 'ONGOING') {
      return (
        <button
          onClick={() => handleStatusChange(job.id, 'CLOSED')}
          disabled={actionLoading === job.id}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-60"
        >
          {actionLoading === job.id ? 'Closing…' : 'Close'}
        </button>
      );
    }

    return (
      <button
        onClick={() => handleStatusChange(job.id, 'DRAFT')}
        disabled={actionLoading === job.id}
        className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-60"
      >
        {actionLoading === job.id ? 'Updating…' : 'Reopen as Draft'}
      </button>
    );
  };

  const renderJobs = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading job postings…</p>
          </div>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No job postings yet</h3>
          <p className="mt-2 text-gray-600">Create your first job posting using the form above.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statusStyles[job.status]}`}>
                    {statusLabels[job.status]}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                    {visibilityLabels[job.visibility]}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 12m0 0A3 3 0 1012 15a3 3 0 001.414-5.657z"
                        />
                      </svg>
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .843-3 1.882v4.236C9 15.157 10.343 16 12 16s3-.843 3-1.882V9.882C15 8.843 13.657 8 12 8z"
                        />
                      </svg>
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3"
                      />
                    </svg>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {job.requirements?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {job.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 lg:items-end">
                {statusActionButtons(job)}
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={actionLoading === job.id}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-60"
                >
                  {actionLoading === job.id ? 'Deleting…' : 'Delete Job'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and publish job opportunities for your organization.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-indigo-50 px-4 py-3 text-indigo-700">
              <p className="text-xs uppercase tracking-wide font-semibold">Total Jobs</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">
              <p className="text-xs uppercase tracking-wide font-semibold">Live Jobs</p>
              <p className="text-2xl font-bold">{jobs.filter((job) => job.status === 'ONGOING').length}</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.75a.75.75 0 111.5 0v4.5a.75.75 0 11-1.5 0v-4.5zm.75 7.25a1 1 0 110 2 1 1 0 010-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{success}</p>
            </div>
          </div>
        </div>
      )}

      {isRecruiter && (
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a new job posting</h2>
          <p className="text-sm text-gray-600 mb-6">
            Jobs are created as drafts. Publish them when you are ready for candidates.
          </p>

          <form onSubmit={handleCreateJob} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formState.title}
                onChange={(event) => handleInputChange('title', event.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formState.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                rows={5}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder="Describe the role, responsibilities, qualifications, and any other important information."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formState.location}
                  onChange={(event) => handleInputChange('location', event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. New York, Remote"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salary Range
                </label>
                <input
                  id="salary"
                  type="text"
                  value={formState.salaryRange}
                  onChange={(event) => handleInputChange('salaryRange', event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. $120k – $150k"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements
              </label>
              <textarea
                id="requirements"
                value={formState.requirements}
                onChange={(event) => handleInputChange('requirements', event.target.value)}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                placeholder={'Add each requirement on a new line.\nExample:\n• 5+ years experience in frontend development\n• Expertise in React and TypeScript'}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                id="visibility"
                value={formState.visibility}
                onChange={(event) => handleInputChange('visibility', event.target.value as JobVisibility)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 bg-white focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="PUBLIC">Public – visible to candidates</option>
                <option value="PRIVATE">Private – internal only</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormState(initialForm)}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-60"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Posting…' : 'Create job'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your job postings</h2>
          <button
            onClick={fetchJobs}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {renderJobs()}
      </section>
    </div>
  );
}

