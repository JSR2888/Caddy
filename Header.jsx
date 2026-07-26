export default function Header({ onOpenBag, onOpenSettings }) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="brand">
          <span className="brand-mark">Caddy</span>
          <span className="brand-tag">Know Your Numbers</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={onOpenBag} aria-label="View bag" title="View bag">
            ⛳
          </button>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings" title="Settings">
            ⚙
          </button>
        </div>
      </div>
    </header>
  );
}
