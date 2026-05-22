import React from 'react';

const SettingsSidebar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="lg:w-64 shrink-0">
    <div className="ds-card-static p-4">
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive ? 'ds-sidebar-nav-item-active w-full' : 'ds-sidebar-nav-item w-full'
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  </div>
);

export default SettingsSidebar;
