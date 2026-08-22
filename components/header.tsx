import Link from "next/link";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/#spaces">Explore</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#safety">Safety</Link>
          <Link href="/saved">Saved</Link>
        </nav>
        <div className="header-actions">
          <Link className="text-link header-sign-in" href={session ? "/account" : "/auth"}>{session ? "My account" : "Sign in"}</Link>
          <Link className="button button-dark button-small" href="/post">
            Post a space <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
