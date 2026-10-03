import PortalShell from "@/components/portal/PortalShell";

const PortalAppLayout = ({ children }: { children: React.ReactNode }) => (
  <PortalShell>{children}</PortalShell>
);

export default PortalAppLayout;
