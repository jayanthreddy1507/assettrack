export interface LogoProps {
  compact?: boolean;
  inverted?: boolean;
}

export function Logo({ compact = false, inverted = false }: LogoProps) {
  return (
    <div className="ui-logo" data-inverted={inverted} aria-label="AssetFlow">
      <span className="ui-logo__mark">AF</span>
      {!compact && <span>AssetFlow</span>}
    </div>
  );
}
