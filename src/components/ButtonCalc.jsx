import { Button } from "@/components/ui/button";
import { ToolTip } from "./ToolTip";

export const ButtonCalc = ({ children, className, onClick, tooltip, id, disabled }) => {
  return (
    <ToolTip description={tooltip}>
      <Button
        className={`border-0 w-full h-full text-base xl:text-2xl flex items-center justify-center outline-none focus:outline-none ${className}`}
        onClick={onClick}
        data-id={id}
        disabled={disabled}
      >
        {children}
      </Button>
    </ToolTip>
  );
};
