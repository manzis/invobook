import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export const getStatusIcon = (status) => {
  const s = (status || '').toLowerCase().replace('_', ' ');
  switch (s) {
    case 'paid':
      return <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} />;
    case 'pending':
      return <Clock className="w-4 h-4" style={{ color: 'var(--ds-badge-text)' }} />;
    case 'overdue':
      return <AlertCircle className="w-4 h-4" style={{ color: 'var(--ds-ship-red)' }} />;
    case 'partially paid':
      return <Clock className="w-4 h-4" style={{ color: 'var(--ds-develop-blue)' }} />;
    case 'draft':
      return <FileText className="w-4 h-4" style={{ color: 'var(--ds-gray-500)' }} />;
    default:
      return <FileText className="w-4 h-4" style={{ color: 'var(--ds-gray-500)' }} />;
  }
};

export const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase().replace('_', ' ');
  switch (s) {
    case 'paid':
      return 'ds-status ds-status-paid';
    case 'pending':
      return 'ds-status ds-status-pending';
    case 'overdue':
      return 'ds-status ds-status-overdue';
    case 'partially paid':
      return 'ds-status ds-status-partial';
    case 'draft':
      return 'ds-status ds-status-draft';
    default:
      return 'ds-status ds-status-draft';
  }
};

/** @deprecated use getStatusBadgeClass */
export const getStatusColor = getStatusBadgeClass;

export const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', JPY: '¥', GBP: '£',
  AUD: '$', CAD: '$', CHF: 'CHF', CNY: '¥',
  INR: '₹', BRL: 'R$', RUB: '₽', ZAR: 'R',
  SGD: '$', NZD: '$', NPR: 'Rs. ',
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
  const numericAmount = parseFloat(amount || 0);
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  const locale = (currencyCode === 'INR' || currencyCode === 'NPR') ? 'en-IN' : 'en-US';
  const formattedValue = numericAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (currencyCode === 'NPR') {
    return 'Rs. ' + formattedValue;
  }
  const needsSpace = symbol.length > 1;
  return symbol + (needsSpace ? ' ' : '') + formattedValue;
};
