import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { BackgroundPlanes } from "./BackgroundPlanes";
import { useWebSocket } from "@/hooks/useWebSocket";

export function AppLayout() {
  // Establish WebSocket connection for the lifetime of the layout
  useWebSocket();

  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-20 min-h-screen relative overflow-hidden">
        <BackgroundPlanes />
        <div className="relative z-10">
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
}
