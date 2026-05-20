import { Wifi, WifiOff } from "lucide-react";
import useNetworkStatus from "../../hooks/useNetworkStatus";

const ConnectionStatus = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-soft">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        Offline. Changes will retry when your connection returns.
      </div>
    </div>
  );
};

export default ConnectionStatus;
