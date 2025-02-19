import { useState, useEffect } from "react"
import {
  Calculator,
  CalendarDays,
  Copyright,
  FlaskConical,
  // Scale,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { ToolTip } from "@/components/ToolTip"

const calculator = [
  {
    title: "Standard",
    url: "/standard",
    icon: Calculator,
  },
  {
    title: "Scientific",
    url: "/scientific",
    icon: FlaskConical,
  },
  {
    title: "Date Calculation",
    url: "/date-calculation",
    icon: CalendarDays,
  },
]

// const converter = [
//   {
//     title: "Weight and mass",
//     url: "#",
//     icon: Scale,
//   },
// ]

export function AppSidebar() {
  const { state } = useSidebar()
  const [headerVisible, setHeaderVisible] = useState(state !== "collapsed")

  const TRANSITION_DURATION_OPEN = 0
  const TRANSITION_DURATION_CLOSE = 150

  useEffect(() => {
    if (state !== "collapsed") {
      const timer = setTimeout(() => {
        setHeaderVisible(true)
      }, TRANSITION_DURATION_OPEN)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setHeaderVisible(false)
      }, TRANSITION_DURATION_CLOSE)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <Sidebar side="left" variant="floating" collapsible="icon" className="bg-black">
      <SidebarHeader className="h-[44px] flex justify-center">
        <div className="flex items-center">
          <ToolTip description={"Ctrl+B"}>
            <SidebarTrigger className="bg-transparent outline-none focus:outline-none p-[14px] border-0 hover:bg-neutral-700" />
          </ToolTip>
          {headerVisible && (
            <span className="ml-2 font-medium text-center truncate">
              Dashboard Menu
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden border-y-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold">Calculator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculator.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-white hover:bg-neutral-800 hover:text-white"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          {/* <div className="w-full h-[2px] bg-secondary my-2" />
          <SidebarGroupLabel>Converter</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {converter.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-white hover:bg-neutral-800 hover:text-white"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent> */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="h-[44px] p-0 flex justify-center">
        {(headerVisible && (
          <span className="text-sm font-light text-center truncate">
            © Developed by{" "}
            <span className="font-extrabold text-neutral-300">Mocha</span>
          </span>
        )) || (
          <span className="text-sm font-light text-center justify-items-center">
            <Copyright />
          </span>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
