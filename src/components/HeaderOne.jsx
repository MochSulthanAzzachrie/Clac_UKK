import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  CircleHelp,
  CalendarDays,
} from "lucide-react";
import { ToolTip } from "@/components/ToolTip";

export const HeaderOne = ({ title }) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  let IconComponent;
  switch (true) {
    case pathname === ("/date-calculation"):
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

//   useEffect(() => {
//     if (
//       pathname === "/standard" ||
//       pathname === "/scientific" ||
//       pathname === "/date-calculation"
//     ) {
//       handleHistemoryClick("history");
//     }
//   }, [pathname, handleHistemoryClick]);

  useHotkeys("shift+h", (e) => {
    e.preventDefault();
    handleHistemoryClick("history");
  });

  useHotkeys("shift+m", (e) => {
    e.preventDefault();
    handleHistemoryClick("memory");
  });

  return (
    <div className="flex flex-row w-full gap-2 ms-1">
      <Card
        className={`border-2 my-2 h-[44px] bg-neutral-900 flex items-center p-2 w-full
        }`}
      >
        <div className="flex items-center w-full">
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
        </div>
      </Card>
    </div>
  );
};
