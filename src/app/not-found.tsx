import { StatusBlock } from "@/components/StatusBlock";

export default function NotFound() {
  return (
    <StatusBlock
      code="404"
      title="That page is not filed here"
      detail="The link may be old, or the project may have been unpublished."
    />
  );
}
