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

export default function Terms() {
  return (
    <>
      <style>{styles}</style>
      <div className="pp-wrap">
        <a href="/" className="pp-back">← Back to WantBoard</a>
        <div className="pp-card">
          <div className="pp-logo">Want<span>Board</span></div>
          <h1>Terms of Service</h1>
          <div className="pp-updated">Last updated: May 20, 2026</div>

          <p>
            Welcome to WantBoard. These Terms of Service ("Terms") govern your access to
            and use of the WantBoard mobile and web application (the "app"). By creating
            an account or using the app, you agree to be bound by these Terms. If you do
            not agree, do not use WantBoard.
          </p>

          <h2>1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use WantBoard. By creating an account,
            you confirm that you meet this age requirement and that the information you
            provide is accurate.
          </p>

          <h2>2. Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login
            credentials and for all activity that occurs under your account. Notify us
            immediately at{" "}
            <a href="mailto:carrion.isaac85@gmail.com">carrion.isaac85@gmail.com</a> if
            you suspect unauthorized use of your account.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree to use WantBoard only for lawful purposes. You will not:</p>
          <ul>
            <li>Post content that is illegal, fraudulent, threatening, harassing, hateful, sexually explicit, or that infringes on the rights of others.</li>
            <li>Impersonate any person or misrepresent your affiliation with any person or entity.</li>
            <li>Post spam, repetitive content, scams, or unsolicited advertising.</li>
            <li>Attempt to circumvent, disable, or interfere with security or safety features of the app.</li>
            <li>Use automated tools (bots, scrapers) to access or collect data from the app.</li>
            <li>Use WantBoard to buy, sell, or solicit anything illegal, regulated, or prohibited (including weapons, drugs, stolen goods, or counterfeit items).</li>
          </ul>

          <h2>4. User-Generated Content</h2>
          <p>
            You retain ownership of the content you post (wants, listings, photos,
            messages, profile info). By posting content to WantBoard, you grant us a
            non-exclusive, worldwide, royalty-free license to host, store, display,
            reproduce, and distribute that content within the app for the purpose of
            operating the service.
          </p>
          <p>
            You are solely responsible for the content you post and represent that you
            have all rights necessary to share it. We do not pre-screen content, but we
            reserve the right to remove any content that violates these Terms.
          </p>

          <h2>5. Reporting and Moderation</h2>
          <p>
            WantBoard has zero tolerance for objectionable content and abusive users.
            You can report any post or user from within the app. We review reports and
            take action — including removing content and suspending accounts — typically
            within 24 hours.
          </p>

          <h2>6. Transactions Between Users</h2>
          <p>
            WantBoard helps connect users who want to buy or sell items, but we are not
            a party to any transaction. All deals, payments, and exchanges happen
            directly between users. We are not responsible for the quality, safety,
            legality, or delivery of items offered, and we do not handle payments or
            disputes between users.
          </p>

          <h2>7. Account Termination</h2>
          <p>
            You may delete your account and all associated data at any time by emailing{" "}
            <a href="mailto:carrion.isaac85@gmail.com">carrion.isaac85@gmail.com</a>{" "}
            from the email address associated with your account.
          </p>
          <p>
            We may suspend or terminate your account, with or without notice, if we
            believe you have violated these Terms, posted prohibited content, or used
            the app in a way that harms other users or the service. Upon termination,
            your right to access and use WantBoard immediately ends.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            WantBoard is provided "as is" and "as available" without warranties of any
            kind, express or implied, including but not limited to warranties of
            merchantability, fitness for a particular purpose, non-infringement, or that
            the service will be uninterrupted, secure, or error-free. You use the app at
            your own risk.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, WantBoard and its operators will not
            be liable for any indirect, incidental, special, consequential, or punitive
            damages arising out of or in connection with your use of the app, including
            but not limited to damages arising from transactions or interactions between
            users.
          </p>

          <h2>10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. The "Last updated" date at the
            top of this page indicates when the Terms were last revised. Continued use
            of WantBoard after changes are posted means you accept the revised Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            If you have any questions about these Terms, contact us at{" "}
            <a href="mailto:carrion.isaac85@gmail.com">carrion.isaac85@gmail.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}
