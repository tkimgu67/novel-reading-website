import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="January 1, 2026"
      sections={[
        { h: "Acceptance of terms", p: "By accessing or using HeyNovelWorld you agree to these Terms & Conditions. If you do not agree, please do not use the website." },
        { h: "Free reading", p: "All published novels and chapters on HeyNovelWorld are free to read for personal, non-commercial use. An account is optional and only required for library features." },
        { h: "Intellectual property", p: "All novels, chapters, cover art and branding are the property of their respective authors and HeyNovelWorld. You may not copy, redistribute or republish content without written permission." },
        { h: "User accounts", p: "You are responsible for keeping your login credentials confidential. Reader accounts cannot publish or modify content — publishing is restricted to HeyNovelWorld administrators." },
        { h: "Acceptable use", p: "You agree not to attempt to disrupt the service, access restricted areas, scrape content at scale or misuse other readers' data." },
        { h: "Changes", p: "We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms." },
      ]}
    />
  );
}
