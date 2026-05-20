import PublicNavbar from "../components/layout/PublicNavbar";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      {children}
    </div>
  );
};

export default PublicLayout;
