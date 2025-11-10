'use client';

import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.email}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'RECRUITER' && 'Recruiter Dashboard'}
          {user?.role === 'ADMIN' && 'Admin Dashboard'}
          {user?.role === 'HIRING_MANAGER' && 'Hiring Manager Dashboard'}
          {user?.role === 'CANDIDATE' && 'Candidate Dashboard'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Candidates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Email:</span>
            <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
          </div>
          {user?.firstName && (
            <div>
              <span className="text-sm text-gray-600">First Name:</span>
              <p className="text-gray-900 font-medium mt-1">{user.firstName}</p>
            </div>
          )}
          {user?.lastName && (
            <div>
              <span className="text-sm text-gray-600">Last Name:</span>
              <p className="text-gray-900 font-medium mt-1">{user.lastName}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">Role:</span>
            <p className="mt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {user?.role}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

