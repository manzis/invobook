import React from 'react';

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium text-gray-900">{label}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

const NotificationsSettings = ({ data, setData }) => {
  const handleToggle = (key) => {
    setData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <Toggle label="Email Notifications" description="Receive email updates about your invoices" checked={data.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
        <Toggle label="Payment Reminders" description="Send automatic reminders for pending payments" checked={data.paymentReminders} onChange={() => handleToggle('paymentReminders')} />
        <Toggle label="Overdue Alerts" description="Get notified when invoices become overdue" checked={data.overdueAlerts} onChange={() => handleToggle('overdueAlerts')} />
        <Toggle label="New Client Alerts" description="Notifications when new clients are added" checked={data.newClientAlerts} onChange={() => handleToggle('newClientAlerts')} />
      </div>
    </div>
  );
};

export default NotificationsSettings;