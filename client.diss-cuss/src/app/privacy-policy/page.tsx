import UpdateLoader from "@/components/global/update-loader";
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 leading-8 tracking-wider py-10 text-text">
      <UpdateLoader/>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Effective Date: 25 May 2025</p>

      <p className="mb-4 text-subtext">
        Welcome to <strong className="text-text">Diss-Cuss</strong>. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains in detail how we collect, use, store, and protect your data when you use our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li className="text-subtext">
          <strong className="text-text">Account Information:</strong> When you register, we collect your email address, username, and any optional profile data (such as profile picture or bio) you provide. This helps us identify you and personalize your experience.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Content:</strong> We store the posts, comments, and replies you create on our platform. This allows us to display your contributions and maintain discussion threads.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Usage Data:</strong> We automatically collect technical information such as your IP address, browser type, device information, and pages you visit. This data helps us monitor site performance, detect abuse, and improve our services.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Cookies & Tracking:</strong> We use cookies and similar technologies to keep you logged in, remember your preferences, and analyze site usage. You can control cookies through your browser settings.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Third-party Services:</strong> We use external APIs (e.g., TMDB for movie information). These services may log your API usage or device data according to their own privacy policies.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Communication Data:</strong> If you contact us (e.g., via email), we may keep records of your correspondence to respond to your inquiries and improve support.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Log Data:</strong> Our servers automatically log requests, errors, and actions taken on the platform for security and troubleshooting.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li className="text-subtext">
          <strong className="text-text">Platform Operation:</strong> To provide core features such as account management, posting, commenting, and content display.
        </li>
        <li className="text-subtext">
          <strong className="text-text">User Authentication:</strong> To securely log you in and out using NextAuth, and to protect your account from unauthorized access.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Real-time Features:</strong> To enable live discussions and notifications using technologies like Socket.io.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Analytics:</strong> To analyze usage patterns, monitor performance, and improve user experience by making data-driven decisions.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Security:</strong> To detect and prevent fraud, abuse, or unauthorized activities on the platform.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Communication:</strong> To respond to your requests, send important updates, or notify you about changes to our services or policies.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li className="text-subtext">
          <strong className="text-text">No Sale of Data:</strong> We do not sell your personal data to third parties.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Analytics Providers:</strong> We may share anonymized, aggregated data with analytics services to understand usage trends.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Legal Compliance:</strong> We may disclose your information if required by law or to protect our rights, users, or the public.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Third-party Integrations:</strong> When you use features powered by external services (like TMDB), your data may be shared as necessary for those features to work.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Storage & Security</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li className="text-subtext">
          <strong className="text-text">Data Retention:</strong> We retain your data as long as your account is active or as needed to provide services. You can request deletion at any time.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Security Measures:</strong> We use industry-standard security practices, including encryption, secure servers, and regular audits to protect your data.
        </li>
        <li className="text-subtext">
          <strong className="text-text">International Transfers:</strong> Your data may be stored or processed in countries outside your own, but we ensure adequate protection in line with applicable laws.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li className="text-subtext">
          <strong className="text-text">Access:</strong> You can request a copy of your personal data we hold.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Correction:</strong> You can update or correct your information at any time via your account settings.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Deletion:</strong> You may request deletion of your account and associated data by contacting us.
        </li>
        <li className="text-subtext">
          <strong className="text-text">Objection:</strong> You can object to certain uses of your data, such as direct marketing.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
      <p className="mb-4 text-subtext">
        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or contacting you directly.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p className="mb-4 text-subtext">
        If you have any questions, requests, or concerns about your privacy or this policy, please contact us at [your email].
      </p>

      <p className="text-sm text-gray-500 mt-10">
        Contact us at <a href="mailto:mk3529895@gmail.com">mk3529895@gmail.com</a> for any privacy-related concerns.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
