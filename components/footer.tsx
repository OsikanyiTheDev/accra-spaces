import Link from "next/link";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div className="footer-brand-block">
          <Brand />
          <p>Clearer property discovery for Greater Accra—built around the details people ask about before they visit.</p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link href="/?mode=rent#spaces">For rent</Link>
            <Link href="/?mode=sale#spaces">For sale</Link>
            <Link href="/post">Post a listing</Link>
          </div>
          <div>
            <h3>Trust</h3>
            <Link href="/#safety">Safety guidance</Link>
            <Link href="/auth">Account access</Link>
            <a href="https://github.com/OsikanyiTheDev/accra-spaces/issues">Contact / feedback</a>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} Accra Spaces. Independent development project.</p>
        <p className="footer-safety"><Icon name="shield" size={15} /> Never pay a viewing fee. Verify before deposits.</p>
      </div>
    </footer>
  );
}
