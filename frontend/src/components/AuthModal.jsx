import React, { useState } from 'react';
import { User, Mail, Lock, Heart, ArrowRight, X } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export function AuthModal({ isOpen, onClose, onLoginSuccess, currentUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState(currentUser?.name || 'Pavana Chandrika Pokuri');
  const [identifier, setIdentifier] = useState(currentUser?.email || currentUser?.phone || 'pavanachandrikapokuri@gmail.com');
  const [password, setPassword] = useState('password123');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dob, setDob] = useState('1995-01-01');
  const [gender, setGender] = useState('Female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!identifier.trim()) {
      setError('Please enter your email address or phone number.');
      return;
    }

    try {
      setLoading(true);
      let userObj;
      if (isSignUp) {
        userObj = await registerUser({
          name: name.trim(),
          identifier: identifier.trim(),
          password: password.trim() || 'password123',
          blood_group: bloodGroup,
          dob,
          gender
        });
      } else {
        userObj = await loginUser({
          name: name.trim(),
          identifier: identifier.trim(),
          password: password.trim() || 'password123'
        });
      }

      onLoginSuccess(userObj);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-gray-900 relative">
        
        {/* Close button if user already logged in */}
        {currentUser && (
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#072D29] text-[#2DD4BF] mx-auto flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {isSignUp ? 'Create Patient Profile' : 'Patient Credentials Login'}
          </h2>
          <p className="text-xs text-gray-500">
            {isSignUp ? 'Register new patient details to access your health vault' : 'Enter your name and email/phone to access your personal records'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Patient Full Name */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Patient Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Pavana Chandrika Pokuri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#044E45] font-medium"
              />
            </div>
          </div>

          {/* Email or Phone Number */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address or Phone Number</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="pavanachandrikapokuri@gmail.com or +91 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#044E45] font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#044E45] font-medium"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 font-medium"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#044E45] hover:bg-[#063C35] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm mt-2"
          >
            <span>{loading ? 'Authenticating Patient...' : isSignUp ? 'Register Patient Account' : 'Sign In Patient'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          {isSignUp ? 'Already registered?' : 'New patient?'}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[#044E45] font-bold hover:underline ml-1"
          >
            {isSignUp ? 'Sign In Patient' : 'Register New Patient'}
          </button>
        </div>

      </div>
    </div>
  );
}
