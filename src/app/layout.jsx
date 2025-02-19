import Cookies from 'js-cookie'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"
import { Histemory } from '@/components/Histemory'

export default function Layout({ children, header, calcHistory, memory, onRecallHistory, memoryClear, memoryRecall, memoryAdd, memorySubtract, memoryStore, clearHistory, deleteHistoryEntry, deleteMemoryEntry, memoryClone, }) {
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
      <main className='flex flex-col w-screen h-screen ml-2 mr-2 2xl:ml-0 2xl:w-full'>
          <Header title={header} />
          <Histemory 
            calcHistory={calcHistory} 
            memory={memory} 
            onRecallHistory={onRecallHistory}
            memoryClear={memoryClear}
            memoryRecall={memoryRecall}
            memoryAdd={memoryAdd}
            memorySubtract={memorySubtract}
            memoryStore={memoryStore}
            clearHistory={clearHistory}
            deleteHistoryEntry={deleteHistoryEntry}
            deleteMemoryEntry={deleteMemoryEntry}
            memoryClone={memoryClone}
          >
            {children}
          </Histemory>
      </main>
    </SidebarProvider>
  )
}
