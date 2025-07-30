import React, { useState } from 'react';
import { Eye, EyeOff, Building2, Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userType: 'employer' | 'executive', email: string, password: string, companyCode?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoading = false, error }) => {
  const [loginType, setLoginType] = useState<'employer' | 'executive'>('employer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@demo.com',
    password: 'password',
    companyCode: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      await onLogin(
        loginType,
        formData.email,
        formData.password,
        loginType === 'employer' ? formData.companyCode : undefined
      );
    } catch (error) {
      setFormError('Login failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deloitte-gray-50 via-white to-deloitte-gray-100 dark:from-deloitte-dark-bg-primary dark:via-deloitte-dark-bg-secondary dark:to-deloitte-dark-bg-tertiary flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 deloitte-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-deloitte-dark dark:text-deloitte-dark-text-primary">Synergy AI</h1>
                <p className="text-deloitte-gray-600 dark:text-deloitte-dark-text-tertiary font-medium">Workspace Intelligence Platform</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-deloitte-dark dark:text-deloitte-dark-text-primary leading-tight">
                Transform Your Workplace with 
                <span className="deloitte-primary"> AI-Powered</span> Insights
              </h2>
              <p className="text-lg text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary leading-relaxed">
                Optimize space utilization, enhance employee productivity, and make data-driven decisions with our comprehensive workspace analytics platform powered by advanced machine learning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start space-x-4 p-6 glass-effect rounded-2xl border border-deloitte-gray-200 dark:border-deloitte-dark-border-primary">
              <div className="w-12 h-12 bg-deloitte-primary bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-deloitte-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary text-lg">Real-time Analytics</h3>
                <p className="text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary mt-1">Monitor space utilization and employee activity with AI-powered insights</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 glass-effect rounded-2xl border border-deloitte-gray-200 dark:border-deloitte-dark-border-primary">
              <div className="w-12 h-12 bg-deloitte-accent bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-deloitte-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary text-lg">Smart Space Management</h3>
                <p className="text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary mt-1">Optimize office layouts and resource allocation using predictive models</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 glass-effect rounded-2xl border border-deloitte-gray-200 dark:border-deloitte-dark-border-primary">
              <div className="w-12 h-12 bg-deloitte-secondary bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-deloitte-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary text-lg">Energy Optimization</h3>
                <p className="text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary mt-1">Reduce costs and environmental impact with intelligent energy management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="bg-white dark:bg-deloitte-dark-surface-primary rounded-3xl card-shadow-lg border border-deloitte-gray-200 dark:border-deloitte-dark-border-primary p-8 transition-colors duration-300">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 deloitte-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 lg:hidden shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-deloitte-dark dark:text-deloitte-dark-text-primary mb-3">Welcome Back</h2>
              <p className="text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary text-lg">Sign in to access your workspace dashboard</p>
            </div>

            {/* Login Type Toggle */}
            <div className="flex bg-deloitte-gray-100 dark:bg-deloitte-dark-surface-accent rounded-2xl p-1.5 mb-8">
              <button
                type="button"
                onClick={() => setLoginType('employer')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginType === 'employer'
                    ? 'bg-white dark:bg-deloitte-dark-surface-primary text-deloitte-primary shadow-md'
                    : 'text-deloitte-gray-600 dark:text-deloitte-dark-text-tertiary hover:text-deloitte-dark dark:hover:text-deloitte-dark-text-primary'
                }`}
              >
                Employer/HR
              </button>
              <button
                type="button"
                onClick={() => setLoginType('executive')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginType === 'executive'
                    ? 'bg-white dark:bg-deloitte-dark-surface-primary text-deloitte-primary shadow-md'
                    : 'text-deloitte-gray-600 dark:text-deloitte-dark-text-tertiary hover:text-deloitte-dark dark:hover:text-deloitte-dark-text-primary'
                }`}
              >
                Executive
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Display */}
              {(error || formError) && (
                <div className="p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-300">{error || formError}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deloitte-gray-400 dark:text-deloitte-dark-text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border border-deloitte-gray-300 dark:border-deloitte-dark-border-primary rounded-xl focus:ring-2 focus:ring-deloitte-primary focus:border-transparent transition-all duration-200 text-deloitte-dark dark:text-deloitte-dark-text-primary bg-white dark:bg-deloitte-dark-surface-secondary placeholder-deloitte-gray-400 dark:placeholder-deloitte-dark-text-muted"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deloitte-gray-400 dark:text-deloitte-dark-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-14 py-4 border border-deloitte-gray-300 dark:border-deloitte-dark-border-primary rounded-xl focus:ring-2 focus:ring-deloitte-primary focus:border-transparent transition-all duration-200 text-deloitte-dark dark:text-deloitte-dark-text-primary bg-white dark:bg-deloitte-dark-surface-secondary placeholder-deloitte-gray-400 dark:placeholder-deloitte-dark-text-muted"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-deloitte-gray-400 dark:text-deloitte-dark-text-muted hover:text-deloitte-gray-600 dark:hover:text-deloitte-dark-text-tertiary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Company Code (for Employer) */}
              {loginType === 'employer' && (
                <div>
                  <label className="block text-sm font-semibold text-deloitte-dark dark:text-deloitte-dark-text-primary mb-3">
                    Company Code
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deloitte-gray-400 dark:text-deloitte-dark-text-muted" />
                    <input
                      type="text"
                      name="companyCode"
                      value={formData.companyCode}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border border-deloitte-gray-300 dark:border-deloitte-dark-border-primary rounded-xl focus:ring-2 focus:ring-deloitte-primary focus:border-transparent transition-all duration-200 text-deloitte-dark dark:text-deloitte-dark-text-primary bg-white dark:bg-deloitte-dark-surface-secondary placeholder-deloitte-gray-400 dark:placeholder-deloitte-dark-text-muted"
                      placeholder="Enter company code"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-deloitte-primary border-deloitte-gray-300 dark:border-deloitte-dark-border-primary rounded focus:ring-deloitte-primary"
                  />
                  <span className="ml-3 text-sm text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-deloitte-primary hover:text-deloitte-accent font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full deloitte-gradient text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg focus:ring-2 focus:ring-deloitte-primary focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-deloitte-gray-200 dark:border-deloitte-dark-border-primary text-center">
              <p className="text-sm text-deloitte-gray-600 dark:text-deloitte-dark-text-secondary">
                Don't have an account?{' '}
                <button className="text-deloitte-primary hover:text-deloitte-accent font-semibold transition-colors">
                  Contact Administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;