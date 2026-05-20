import { Wifi, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";

const statusLabel = {
  connected: "Connected",
  connecting: "Connecting",
  reconnecting: "Reconnecting",
  error: "Offline",
};

const CollaboratorPresence = ({ collaborators = [], connectionStatus }) => {
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant={isConnected ? "accent" : "outline"} className="gap-1.5">
        {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        {statusLabel[connectionStatus] || "Connecting"}
      </Badge>
      <div className="flex -space-x-2">
        {collaborators.slice(0, 5).map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 border-2 border-card">
                <AvatarFallback style={{ backgroundColor: collaborator.color, color: "white" }}>
                  {(collaborator.name || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{collaborator.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {collaborators.length} collaborator{collaborators.length === 1 ? "" : "s"} online
      </span>
    </div>
  );
};

export default CollaboratorPresence;
