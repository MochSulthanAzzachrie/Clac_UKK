import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Calculator,
  FlaskConical,
  Save,
  History,
  CircleHelp,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolTip } from "@/components/ToolTip";

export const Header = ({ title }) => {
  const location = useLocation();
  const { pathname, search } = location;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(search);
  const histemory = queryParams.get("histemory");
  const isDateCalculation = location.pathname.includes("date-calculation");

  let IconComponent;
  switch (true) {
    case pathname === "/standard":
      IconComponent = Calculator;
      break;
    case pathname.startsWith("/scientific"):
      IconComponent = FlaskConical;
      break;
    case pathname.startsWith("/date-calculation"):
      IconComponent = CalendarDays;
      break;
    default:
      IconComponent = CircleHelp;
  }

  const handleHistemoryClick = useCallback(
    (type) => {
      const currentPath = window.location.pathname;
      const currentQuery = new URLSearchParams(window.location.search);
      currentQuery.set("histemory", type);
      navigate(`${currentPath}?${currentQuery.toString()}`, { replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    if (
      pathname === "/standard" ||
      pathname === "/scientific" ||
      pathname === "/date-calculation"
    ) {
      handleHistemoryClick("history");
    }
  }, [pathname, handleHistemoryClick]);

  useHotkeys("shift+h", (e) => {
    e.preventDefault();
    handleHistemoryClick("history");
  });

  useHotkeys("shift+m", (e) => {
    e.preventDefault();
    handleHistemoryClick("memory");
  });

  return (
    <div className="flex flex-row w-full gap-2 xl:ms-1">
      <Card
        className={`border-2 my-2 h-[44px] bg-neutral-900 flex items-center p-2 w-full ${
          isDateCalculation ? "xl:w-1/2" : "xl:w-5/6"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="block sm:hidden">
              <span className="flex items-center">
                <ToolTip description={"Ctrl+B"}>
                  <SidebarTrigger className="bg-transparent outline-none focus:outline-none p-[14px] border-0 hover:bg-neutral-700" />
                </ToolTip>
                <div className="w-[2px] h-7 bg-secondary mx-2" />
              </span>
            </span>
            <span className="flex items-center">
              <IconComponent className="hidden w-5 h-5 sm:block" />
              <div className="w-[2px] h-7 bg-secondary mx-2 hidden sm:block" />
              <p className="text-base font-semibold xl:text-xl">{title}</p>
              <span className="block p-1 ml-2 border-2 rounded-lg sm:hidden">
                <IconComponent className="w-5 h-5" />
              </span>
            </span>
          </div>
          <div className="block sm:hidden">
            <div className="flex items-center gap-2">
              <ToolTip description={"Shift+H"}>
                <Button
                  className={`flex items-center p-1 h-[1.60rem] ${
                    histemory === "history"
                      ? "bg-neutral-700"
                      : "bg-neutral-900"
                  } text-white font-medium outline-none focus:outline-none hover:bg-neutral-700 border-0 text-sm px-2`}
                  onClick={() => handleHistemoryClick("history")}
                >
                  <History />
                </Button>
              </ToolTip>
              <ToolTip description={"Shift+M"}>
                <Button
                  className={`flex items-center p-1 h-[1.60rem] ${
                    histemory === "memory" ? "bg-neutral-700" : "bg-neutral-900"
                  } text-white font-medium outline-none focus:outline-none hover:bg-neutral-700 border-0 text-sm px-2`}
                  onClick={() => handleHistemoryClick("memory")}
                >
                  <Save />
                </Button>
              </ToolTip>
            </div>
          </div>
        </div>
      </Card>
      <Card
        className={`border-2 my-2 h-[44px] bg-neutral-900 p-2 hidden sm:block ${
          isDateCalculation ? "w-1/2" : "w-1/6"
        }`}
      >
        <div className="flex items-center">
          <div className="flex items-center justify-between w-full">
            <ToolTip description={"Shift+H"}>
              <Button
                className={`flex items-center p-1 h-[1.60rem] ${
                  histemory === "history" ? "bg-neutral-700" : "bg-neutral-900"
                } text-white font-medium outline-none focus:outline-none hover:bg-neutral-700 border-0 text-sm px-2`}
                onClick={() => handleHistemoryClick("history")}
              >
                <History />
                History
              </Button>
            </ToolTip>
            <ToolTip description={"Shift+M"}>
              <Button
                className={`flex items-center p-1 h-[1.60rem] ${
                  histemory === "memory" ? "bg-neutral-700" : "bg-neutral-900"
                } text-white font-medium outline-none focus:outline-none hover:bg-neutral-700 border-0 text-sm px-2`}
                onClick={() => handleHistemoryClick("memory")}
              >
                <Save />
                Memory
              </Button>
            </ToolTip>
          </div>
        </div>
      </Card>
    </div>
  );
};
