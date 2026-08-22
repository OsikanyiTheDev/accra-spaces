import { Icon } from "@/components/icons";
import type { ResultSource } from "@/lib/types";

export function SourceNotice({ source, message }: { source: ResultSource; message?: string }) {
  if (source === "api") return null;
  return (
    <div className={`source-notice ${source === "unavailable" ? "is-error" : ""}`} role="status">
      <Icon name="info" size={18} />
      <p>
        {source === "demo" ? (
          <><strong>Interface preview.</strong> These cards are clearly marked illustrative examples—not live properties or real availability.</>
        ) : (
          <><strong>Listings unavailable.</strong> {message}</>
        )}
      </p>
    </div>
  );
}
