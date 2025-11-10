'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/recruiter/login');
    } else if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, router, fetchUser]);

  const handleLogout = () => {
    logout();
    router.push('/recruiter/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName || user.email}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'RECRUITER' && 'Recruiter Dashboard'}
                {user.role === 'ADMIN' && 'Admin Dashboard'}
                {user.role === 'HIRING_MANAGER' && 'Hiring Manager Dashboard'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Email:</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
            {user.firstName && (
              <div className="flex items-center">
                <span className="text-gray-600 w-32">First Name:</span>
                <span className="text-gray-900 font-medium">{user.firstName}</span>
              </div>
            )}
            {user.lastName && (
              <div className="flex items-center">
                <span className="text-gray-600 w-32">Last Name:</span>
                <span className="text-gray-900 font-medium">{user.lastName}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Role:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {(user.role === 'RECRUITER' || user.role === 'ADMIN' || user.role === 'HIRING_MANAGER') && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/recruiter/jobs"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Manage Jobs</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage job postings</p>
              </Link>

              <Link
                href="/recruiter/applications"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Applications</h3>
                <p className="text-sm text-gray-600 mt-1">Review candidate applications</p>
              </Link>

              <Link
                href="/recruiter/organization"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Organization</h3>
                <p className="text-sm text-gray-600 mt-1">Manage organization settings</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

