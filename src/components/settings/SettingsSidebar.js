import React from 'react';

const SettingsSidebar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="lg:w-64">
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  </div>
);

export default SettingsSidebar;