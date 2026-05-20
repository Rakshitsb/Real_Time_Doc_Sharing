import DashboardNavbar from "../components/layout/DashboardNavbar";

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <DashboardNavbar title={title} subtitle={subtitle}>
      {children}
    </DashboardNavbar>
  );
};

export default DashboardLayout;
