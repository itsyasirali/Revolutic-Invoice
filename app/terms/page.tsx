import LegalPage from "@/components/legal/LegalPage";
import { termsSections } from "@/data/legal";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta(
  "Terms & Conditions",
  "The terms that govern your use of InvoiceSmarty, including accounts, your data, acceptable use, fees and liability.",
  "/terms",
);

const TermsPage = () => (
  <LegalPage
    badge="Legal / Terms & Conditions"
    title="Terms &"
    highlight="Conditions"
    intro="Please read these terms carefully. They explain the rules for using InvoiceSmarty and what you can expect from us."
    sections={termsSections}
  />
);

export default TermsPage;
