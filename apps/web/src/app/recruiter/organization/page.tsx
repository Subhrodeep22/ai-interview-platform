'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings?: any;
  createdAt: string;
  updatedAt: string;
  users?: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  }>;
  _count?: {
    jobs: number;
    users: number;
  };
}

export default function OrganizationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Form state for creating organization
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    plan: 'FREE',
  });

  // Form state for editing organization
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    plan: 'FREE',
  });

  // Fetch organization when component mounts
  useEffect(() => {
    if (user && !organization) {
      fetchOrganization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrganization = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/recruiter/login');
        return;
      }

      const response = await api.get('/api/recruiter/org/me');
      setOrganization(response.data.organization);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/recruiter/login');
        return;
      }
      setError(err?.response?.data?.error || 'Failed to fetch organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Generate slug from name if not provided
    const slug = createForm.slug || createForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!createForm.name || !slug) {
      setError('Organization name is required');
      return;
    }

    try {
      setIsCreating(true);
      const response = await api.post('/api/recruiter/org/create', {
        name: createForm.name,
        slug: slug,
        plan: createForm.plan,
      });
      setOrganization(response.data.organization);
      setIsCreating(false);
      // Refresh user data to get updated organizationId
      // Organization created/updated, refresh organization data
      // Fetch organization again to get full details
      await fetchOrganization();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create organization');
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setError('');
    try {
      const response = await api.put(`/api/recruiter/org/${organization.id}`, editForm);
      setOrganization(response.data.organization);
      setShowEditForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update organization');
    }
  };

  const handleDelete = async () => {
    if (!organization) return;
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/recruiter/org/${organization.id}`);
      setOrganization(null);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete organization');
    }
  };

  const startEditing = () => {
    if (organization) {
      setEditForm({
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
      });
      setShowEditForm(true);
    }
  };

  // Generate slug from name
  const handleNameChange = (name: string, isEdit: boolean = false) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (isEdit) {
      setEditForm({ ...editForm, name, slug });
    } else {
      setCreateForm({ ...createForm, name, slug });
    }
  };

  // Show loading if checking auth or fetching organization
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has access
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN' && user.role !== 'HIRING_MANAGER')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-red-600">You don't have access to this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Organization Management</h1>
        <p className="text-gray-600">Manage your organization settings and details</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* No Organization - Create Form */}
        {!organization && !showEditForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Organization</h2>
              <p className="text-gray-600">
                Get started by creating an organization to manage jobs and team members
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Inc."
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="acme-inc"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Used in URLs. Lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  id="plan"
                  value={createForm.plan}
                  onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-semibold text-sm transition-all duration-200 ${
                  isCreating
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Organization Details */}
        {organization && !showEditForm && (
          <div className="space-y-6">
            {/* Main Organization Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
                      <p className="text-sm text-gray-500">@{organization.slug}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Plan</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        organization.plan === 'FREE'
                          ? 'bg-gray-100 text-gray-800'
                          : organization.plan === 'STARTER'
                          ? 'bg-blue-100 text-blue-800'
                          : organization.plan === 'PROFESSIONAL'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {organization.plan}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {organization._count?.jobs || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Jobs</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {organization._count?.users || organization.users?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Team Members</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{organization.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(organization.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(organization.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Team Members Section */}
            {organization.users && organization.users.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Members</h3>
                <div className="space-y-4">
                  {organization.users.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                          {(member.firstName?.[0] || member.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : member.email}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Organization Form */}
        {organization && showEditForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Organization</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="edit-slug" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Slug *
                </label>
                <input
                  id="edit-slug"
                  type="text"
                  required
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="edit-plan" className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  id="edit-plan"
                  value={editForm.plan}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

