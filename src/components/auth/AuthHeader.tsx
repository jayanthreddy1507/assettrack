import { Logo } from "@/components/ui/Logo";

type AuthHeaderProps = { title: string; description: string };

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <Logo compact />
      <div>
        <h2 className="heading-2">{title}</h2>
        <p className="paragraph-small">{description}</p>
      </div>
    </header>
  );
}
