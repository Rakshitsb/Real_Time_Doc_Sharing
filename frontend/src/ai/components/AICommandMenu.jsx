import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AI_ACTION_GROUPS } from "../utils/aiActions";
import { cn } from "../../utils/cn";

const AICommandMenu = ({ activeAction, hasSelection, onSelect }) => {
  return (
    <div className="space-y-4">
      {AI_ACTION_GROUPS.map((group) => (
        <section key={group.title} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.actions.map((action) => {
              const disabled = action.requiresSelection && !hasSelection;
              return (
                <Button
                  key={action.id}
                  type="button"
                  variant={activeAction === action.id ? "secondary" : "outline"}
                  className={cn("justify-start", disabled && "opacity-45")}
                  disabled={disabled}
                  onClick={() => onSelect(action)}
                >
                  <Sparkles className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default AICommandMenu;
