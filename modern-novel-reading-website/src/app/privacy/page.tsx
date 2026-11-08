import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="January 1, 2026"
      sections={[
        { h: "Information we collect", p: "When you create an account we store your name, email address and a securely hashed password. We never store your password in plain text. As you read, we save your bookmarks, favorites and reading progress so you can continue on any device." },
        { h: "How we use your information", p: "Your information is used solely to operate HeyNovelWorld: signing you in, maintaining your personal library and improving the reading experience. We do not sell your personal data to third parties." },
        { h: "Cookies & local storage", p: "We use a single secure, HTTP-only session cookie to keep you logged in. Reading preferences such as font size and theme, and guest reading progress, are stored locally in your browser." },
        { h: "Data security", p: "Access to publishing tools is restricted to administrators and enforced on the server for every request. Passwords are hashed with bcrypt and sessions expire automatically." },
        { h: "Your rights", p: "You may update your profile at any time, and you can contact us to request deletion of your account and all associated data." },
        { h: "Contact", p: "Questions about this policy? Reach us via the Contact Us page or at hello@heynovelworld.com." },
      ]}
    />
  );
}
