const SettingsHeader = ({ onSave, isLoading, statusMessage }) => (
  <div className="ds-page-header">
    <div>
      <h1 className="ds-section-title">Settings</h1>
      <p className="ds-page-subtitle">Manage your account and application preferences</p>
    </div>
    <div className="flex items-center gap-4">
      {statusMessage && (
        <span className="text-sm text-[var(--ds-gray-600)]">{statusMessage}</span>
      )}
      <button type="button" onClick={onSave} disabled={isLoading} className="ds-btn-dark">
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
);

export default SettingsHeader;
