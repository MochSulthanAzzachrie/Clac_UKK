import Cookies from 'js-cookie'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Main } from '@/components/Main'
import { HeaderOne } from '@/components/HeaderOne'

export default function LayoutOne({ children, header }) {
  const sidebarState = Cookies.get("sidebar:state")
  const defaultOpen = sidebarState === "true"

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "14rem",
        "--sidebar-width-mobile": "10rem",
      }}
      defaultOpen={defaultOpen}
      className="w-full"
    >
      <AppSidebar />
      <main className='flex flex-col w-screen h-screen mr-2 h-sc 2xl:ml-0 2xl:w-full'>
          <HeaderOne title={header} />
          <Main className={`flex w-full h-full mb-2 ms-1`}>
            {children}
          </Main>
      </main>
    </SidebarProvider>
  )
}
