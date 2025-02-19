import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ToolTip = ({ children, description }) => {
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger className="p-0 m-0 bg-transparent border-none appearance-none cursor-pointer">
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
