import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const PageShell = ({ children, noFooter = false }) => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <AppHeader />
    <main className="flex-1">{children}</main>
    {!noFooter && <AppFooter />}
  </div>
);

export default PageShell;
