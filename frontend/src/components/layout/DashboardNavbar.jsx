import AppShell from "./AppShell";

const DashboardNavbar = ({ children, title, subtitle }) => {
  return (
    <AppShell title={title} subtitle={subtitle}>
      {children}
    </AppShell>
  );
};

export default DashboardNavbar;
