// /components/settings/SettingsHeader.jsx (Updated)

// ... imports
const SettingsHeader = ({ onSave, isLoading, statusMessage }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600">Manage your account and application preferences</p>
    </div>
    <div className="flex items-center space-x-4">
      {statusMessage && <span className="text-sm text-gray-600">{statusMessage}</span>}
      <button 
        onClick={onSave}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
);
export default SettingsHeader;