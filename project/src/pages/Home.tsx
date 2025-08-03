import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, Receipt, TrendingUp, Users, DollarSign } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to POS System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Streamline your business operations with our comprehensive Point of Sale system. 
          Manage products, create quotations, and generate invoices with ease.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <FeatureCard
          icon={ShoppingBag}
          title="Product Management"
          description="Add, edit, and manage your product inventory with detailed information including codes, descriptions, and pricing."
          to="/products"
          color="blue"
        />
        <FeatureCard
          icon={FileText}
          title="Smart Quotations"
          description="Create professional quotations with automatic calculations, discounts, and easy conversion to invoices."
          to="/quotations"
          color="emerald"
        />
        <FeatureCard
          icon={Receipt}
          title="Invoice Management"
          description="Generate and track invoices with comprehensive customer information and payment status."
          to="/invoices"
          color="orange"
        />
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          System Overview
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Sales Growth"
            value="24%"
            description="Month over month"
            color="green"
          />
          <StatCard
            icon={Users}
            title="Active Customers"
            value="1,247"
            description="Total registered"
            color="blue"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value="$45,678"
            description="This month"
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-blue-100 mb-6">
          Create your first product or quotation to begin using the system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Add Products
          </Link>
          <Link
            to="/quotations"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
          >
            Create Quotation
          </Link>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
  color: 'blue' | 'emerald' | 'orange';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, to, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <Link to={to} className="group">
      <div className="bg-white rounded-xl shadow-lg p-6 h-full transition-transform duration-200 group-hover:scale-105">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
  color: 'green' | 'blue' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, color }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default Home;