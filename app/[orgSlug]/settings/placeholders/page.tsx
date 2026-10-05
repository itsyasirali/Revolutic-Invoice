import PlaceholdersSettings from "@/components/settings/PlaceholdersSettings";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Placeholders", "Create custom placeholders for your invoice, quote and email text.");


const PlaceholdersPage = () => <PlaceholdersSettings />;

export default PlaceholdersPage;
