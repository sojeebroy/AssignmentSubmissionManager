import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700">Users</h3>
          <p className="text-sm text-gray-500 mt-2">Manage users and roles.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700">Classes</h3>
          <p className="text-sm text-gray-500 mt-2">Overview of classes.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-700">Assignments</h3>
          <p className="text-sm text-gray-500 mt-2">Quick links to assignment tools.</p>
        </div>
      </div>
    </div>
  );
}
