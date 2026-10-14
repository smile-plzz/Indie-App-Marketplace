import { StatusBlock } from "@/components/StatusBlock";

/**
 * Scoped to the public group so a missing project keeps the sidebar and the
 * visitor never lands on a chromeless page.
 */
export default function NotFound() {
  return (
    <StatusBlock
      code="404"
      title="That page is not filed here"
      detail="The link may be old, or the project may have been unpublished."
    />
  );
}
