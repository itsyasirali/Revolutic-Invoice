import LegalPage from "@/components/legal/LegalPage";
import { privacySections } from "@/data/legal";
import { publicMeta } from "@/lib/pageMeta";

export const metadata = publicMeta(
  "Privacy Policy",
  "How InvoiceSmarty collects, uses, shares and protects personal data, and the choices and rights you have.",
  "/privacy",
);

const PrivacyPage = () => (
  <LegalPage
    title="Privacy Policy"
    intro="We take your privacy seriously. This policy explains what data we collect, why we collect it and how you stay in control."
    sections={privacySections}
  />
);

export default PrivacyPage;
