import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export const getStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-600" />;
    case 'overdue':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'draft':
      return <FileText className="w-4 h-4 text-gray-600" />;
    default:
      return <FileText className="w-4 h-4 text-gray-600" />;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};