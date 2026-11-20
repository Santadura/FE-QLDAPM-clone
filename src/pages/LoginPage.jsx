import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-[#1a365d] text-white font-bold px-3 py-1 rounded">I</div>
          <span className="font-bold text-[#1a365d] text-lg">IIG Learning</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 text-sm tracking-wider">ENTERPRISE ERP PORTAL</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>System Operational</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex items-center justify-center p-4">
        <div><LoginForm /><p className="mt-5 text-center text-sm text-slate-500">Bạn là học viên? <Link to="/courses" className="font-medium text-[#173557] underline">Khám phá khóa học</Link></p></div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 bg-[#f8f9fa] flex justify-between items-center text-xs text-gray-500 border-t border-gray-200">
        <div>© 2024 IIG Learning ERP System. All rights reserved.</div>
        <div className="flex space-x-4">
          <span>v2.4.1</span>
          <span>•</span>
          <span>Internal Access Only</span>
          <span>•</span>
          <a href="#" className="hover:text-gray-700">Privacy & Compliance</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
