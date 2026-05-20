import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
