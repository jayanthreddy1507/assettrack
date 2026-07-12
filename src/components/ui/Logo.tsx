export interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="ui-logo" aria-label="AssetFlow">
      <span className="ui-logo__mark">AF</span>
      {!compact && <span>AssetFlow</span>}
    </div>
  );
}
