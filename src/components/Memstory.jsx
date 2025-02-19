import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { ToolTip } from "@/components/ToolTip";

export const Memstory = ({ memoryClear, memoryRecall, memoryAdd, memorySubtract, memoryStore, isMemoryEmpty, }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleButtonClick = useCallback(
    (type) => {
      if (isMemoryEmpty && (type === "mc" || type === "mr")) {
        return;
      }
      setHoveredButton(type);
      setTimeout(() => setHoveredButton(null), 300);
      if (type === "mc") {
          memoryClear();
      } else if (type === "mr") {
          memoryRecall();
      } else if (type === "m+") {
          memoryAdd();
      } else if (type === "m-") {
          memorySubtract();
      } else if (type === "ms") {
          memoryStore();
      }
    },
    [memoryClear, memoryRecall, memoryAdd, memorySubtract, memoryStore, isMemoryEmpty,]
  );

  useHotkeys("ctrl+l", (e) => {
    e.preventDefault();
    handleButtonClick("mc");
  });

  useHotkeys("ctrl+r", (e) => {
    e.preventDefault();
    handleButtonClick("mr");
  });

  useHotkeys("ctrl+p", (e) => {
    e.preventDefault();
    handleButtonClick("m+");
  });

  useHotkeys("ctrl+q", (e) => {
    e.preventDefault();
    handleButtonClick("m-");
  });

  useHotkeys("ctrl+m", (e) => {
    e.preventDefault();
    handleButtonClick("ms");
  });

  return (
    <div className="my-2 h-[46px] xl:h-[4rem] bg-inherit flex items-center w-full gap-1">
      <ToolTip description={"Ctrl+L"}>
        <Button
          className={`flex items-center h-[46px] xl:h-[4rem] w-[46px] xl:w-[4rem] bg-inherit text-white outline-none focus:outline-none hover:bg-neutral-800 border-0 disabled:text-opacity-50
            ${hoveredButton === "mc" ? "bg-neutral-800" : ""}
          `}
          onClick={() => handleButtonClick("mc")}
          disabled={isMemoryEmpty}
        >
          <p className="text-sm font-medium xl:text-base">MC</p>
        </Button>
      </ToolTip>
      <ToolTip description={"Ctrl+R"}>
        <Button
          className={`flex items-center h-[46px] xl:h-[4rem] w-[46px] xl:w-[4rem] bg-inherit text-white outline-none focus:outline-none hover:bg-neutral-800 border-0 disabled:text-opacity-50
            ${hoveredButton === "mr" ? "bg-neutral-800" : ""}
          `}
          onClick={() => handleButtonClick("mr")}
          disabled={isMemoryEmpty}
        >
          <p className="text-sm font-medium xl:text-base">MR</p>
        </Button>
      </ToolTip>
      <ToolTip description={"Ctrl+P"}>
        <Button
          className={`flex items-center h-[46px] xl:h-[4rem] w-[46px] xl:w-[4rem] bg-inherit text-white outline-none focus:outline-none hover:bg-neutral-800 border-0
            ${hoveredButton === "m+" ? "bg-neutral-800" : ""}
          `}
          onClick={() => handleButtonClick("m+")}
        >
          <p className="text-sm font-medium xl:text-base">M+</p>
        </Button>
      </ToolTip>
      <ToolTip description={"Ctrl+Q"}>
        <Button
          className={`flex items-center h-[46px] xl:h-[4rem] w-[46px] xl:w-[4rem] bg-inherit text-white outline-none focus:outline-none hover:bg-neutral-800 border-0
            ${hoveredButton === "m-" ? "bg-neutral-800" : ""}
          `}
          onClick={() => handleButtonClick("m-")}
        >
          <p className="text-sm font-medium xl:text-base">M-</p>
        </Button>
      </ToolTip>
      <ToolTip description={"Ctrl+M"}>
        <Button
          className={`flex items-center h-[46px] xl:h-[4rem] w-[46px] xl:w-[4rem] bg-inherit text-white outline-none focus:outline-none hover:bg-neutral-800 border-0
            ${hoveredButton === "ms" ? "bg-neutral-900" : ""}
          `}
          onClick={() => handleButtonClick("ms")}
        >
          <p className="text-sm font-medium xl:text-base">MS</p>
        </Button>
      </ToolTip>
    </div>
  );
};
