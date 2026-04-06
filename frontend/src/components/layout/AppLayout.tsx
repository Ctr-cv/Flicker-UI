import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { BackgroundPlanes } from "./BackgroundPlanes";
import { useWebSocket } from "@/hooks/useWebSocket";

export function AppLayout() {
  useWebSocket();

  const location = useLocation();
  const page = location.pathname.split("/").filter(Boolean)[0] ?? "intro";

  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-20 min-h-screen relative overflow-hidden">
        <BackgroundPlanes page={page} />
        <div className="relative z-10">
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
}
