import { PortalForgotPassword } from "@/components/portal/PortalAuth";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Forgot Password", "Request a link to reset your customer portal password.");

const Page = () => <PortalForgotPassword />;

export default Page;
