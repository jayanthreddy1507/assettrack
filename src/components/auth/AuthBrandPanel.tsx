import { Logo } from "@/components/ui";

export function AuthBrandPanel() {
  return (
    <section className="auth-brand-panel" aria-label="AssetFlow introduction">
      <div>
        <Logo />
        <h1 className="auth-brand-panel__title">
          Enterprise Asset &amp; Resource Management System
        </h1>
        <p className="auth-brand-panel__description">
          Track assets, manage allocations and keep every shared resource visible from one
          simple workspace.
        </p>
      </div>

      <div className="auth-illustration" aria-hidden="true">
        <div className="auth-illustration__sun" />
        <div className="auth-illustration__plant">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="auth-illustration__desk" />
        <div className="auth-illustration__laptop">
          <div className="auth-illustration__screen">
            <div className="auth-illustration__screen-logo">AF</div>
          </div>
          <div className="auth-illustration__keyboard" />
        </div>
        <div className="auth-illustration__chair">
          <span />
          <i />
        </div>
        <div className="auth-illustration__box" />
      </div>
    </section>
  );
}
