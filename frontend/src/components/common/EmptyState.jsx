import { FileText } from "lucide-react";
import { Button } from "../ui/button";

const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
      <FileText className="h-6 w-6" />
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {actionLabel && (
      <Button className="mt-5" type="button" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
