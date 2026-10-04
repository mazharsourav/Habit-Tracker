import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileNav from "./MobileNav.jsx";
import Footer from "./Footer.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      <MobileNav />
      <div className="md:pl-[232px]">
        <main className="mx-auto flex min-h-screen max-w-[1120px] flex-col px-4 pb-28 pt-6 sm:px-6 md:px-12 md:pb-10 md:pt-10">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer className="mt-16" />
        </main>
      </div>
    </div>
  );
}
