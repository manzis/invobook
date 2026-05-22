import React from 'react';

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h4 className="font-medium text-[var(--ds-black)]">{label}</h4>
      <p className="text-sm text-[var(--ds-gray-600)]">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-[var(--ds-gray-100)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-[var(--ds-shadow-ring-light)] peer-checked:bg-[var(--ds-black)]" />
    </label>
  </div>
);

const NotificationsSettings = ({ data, setData }) => {
  const handleToggle = (key) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="ds-card-static">
      <h3 className="ds-card-title text-lg mb-6">Notification Preferences</h3>
      <div className="space-y-6">
        <Toggle
          label="Email Notifications"
          description="Receive email updates about your invoices"
          checked={data.emailNotifications}
          onChange={() => handleToggle('emailNotifications')}
        />
        <Toggle
          label="Payment Reminders"
          description="Send automatic reminders for pending payments"
          checked={data.paymentReminders}
          onChange={() => handleToggle('paymentReminders')}
        />
        <Toggle
          label="Overdue Alerts"
          description="Get notified when invoices become overdue"
          checked={data.overdueAlerts}
          onChange={() => handleToggle('overdueAlerts')}
        />
        <Toggle
          label="New Client Alerts"
          description="Notifications when new clients are added"
          checked={data.newClientAlerts}
          onChange={() => handleToggle('newClientAlerts')}
        />
      </div>
    </div>
  );
};

export default NotificationsSettings;
