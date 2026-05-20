import React from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#F7F5F2;color:#1A1A1A;-webkit-font-smoothing:antialiased;line-height:1.6}
.pp-wrap{max-width:760px;margin:0 auto;padding:48px 20px 80px}
.pp-back{display:inline-block;color:#6B6560;text-decoration:none;font-size:13px;font-weight:600;margin-bottom:24px}
.pp-back:hover{color:#E84B2A}
.pp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;margin-bottom:8px}
.pp-logo span{color:#E84B2A}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:36px;margin:8px 0 6px}
.pp-updated{color:#6B6560;font-size:14px;margin-bottom:32px}
h2{font-family:'Syne',sans-serif;font-weight:700;font-size:20px;margin:28px 0 10px}
p,li{font-size:15px;color:#1A1A1A;margin-bottom:10px}
ul{padding-left:22px;margin-bottom:10px}
a{color:#E84B2A}
.pp-card{background:#FFFFFF;border:1px solid #E2DDD8;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.04)}
`;

export default function Privacy() {
  return (
    <>
      <style>{styles}</style>
      <div className="pp-wrap">
        <a href="/" className="pp-back">← Back to WantBoard</a>
        <div className="pp-card">
          <div className="pp-logo">Want<span>Board</span></div>
          <h1>Privacy Policy</h1>
          <div className="pp-updated">Last updated: May 20, 2026</div>

          <p>
            This Privacy Policy explains how WantBoard ("we", "us", or "the app") collects,
            uses, and protects information when you use our mobile and web application.
          </p>

          <h2>1. Information We Collect</h2>
          <p>When you use WantBoard, we collect the following information:</p>
          <ul>
            <li><strong>Account information:</strong> your email address and display name, provided when you sign up with email/password or Google Sign-In.</li>
            <li><strong>Content you post:</strong> wants, listings, comments, photos, and other content you choose to upload.</li>
            <li><strong>Profile data:</strong> optional profile photo and any details you add to your profile.</li>
            <li><strong>Interaction data:</strong> likes, saves, and messages you send within the app.</li>
          </ul>
          <p>We do not collect location data, contacts, or device identifiers beyond what is required for authentication.</p>

          <h2>2. How Your Data Is Stored</h2>
          <p>
            All data is stored using <strong>Google Firebase</strong> services, including
            Firebase Authentication (for accounts), Cloud Firestore (for posts and profile
            data), and Firebase Storage (for uploaded photos). Firebase encrypts data in
            transit and at rest. You can review Google's privacy practices at{" "}
            <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
              firebase.google.com/support/privacy
            </a>.
          </p>

          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To create and maintain your account.</li>
            <li>To display your posts and profile to other users of the app.</li>
            <li>To enable interactions such as likes, comments, and messages.</li>
            <li>To keep the app secure and prevent abuse.</li>
          </ul>
          <p>We do not sell your data, and we do not share it with advertisers or third-party marketers.</p>

          <h2>4. Who Can See Your Content</h2>
          <p>
            Posts, profile names, and profile photos you create in WantBoard are visible to
            other signed-in users of the app. Your email address is not displayed publicly.
          </p>

          <h2>5. Data Retention and Deletion</h2>
          <p>
            We keep your account and content for as long as your account is active. You can
            request deletion of your account and all associated data at any time by emailing{" "}
            <a href="mailto:carrion.isaac85@gmail.com">carrion.isaac85@gmail.com</a> from the
            email address associated with your account. We will permanently delete your
            account, posts, uploaded images, and profile data from Firebase within 30 days of
            your request.
          </p>

          <h2>6. Children's Privacy</h2>
          <p>
            WantBoard is not directed to children under 13, and we do not knowingly collect
            information from children under 13. If you believe a child has provided us with
            personal data, please contact us so we can remove it.
          </p>

          <h2>7. Security</h2>
          <p>
            We rely on Firebase's industry-standard security to protect your data. However,
            no online service can guarantee absolute security. Please use a strong, unique
            password for your account.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The "Last updated" date at
            the top of this page indicates when it was last revised. Continued use of
            WantBoard after changes are posted means you accept the revised policy.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or your data, contact us at{" "}
            <a href="mailto:carrion.isaac85@gmail.com">carrion.isaac85@gmail.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}
