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
.pp-tagline{font-size:15px;color:#6B6560;margin-bottom:28px;font-weight:500}
.pp-email{font-size:14px;color:#6B6560;margin-bottom:24px}
.pp-email a{color:#E84B2A;text-decoration:none;font-weight:600}
.pp-email a:hover{text-decoration:underline}
.pp-faq{display:flex;flex-direction:column;gap:20px}
.pp-faq-item{background:#FFFFFF;border:1px solid #E2DDD8;border-radius:12px;padding:20px}
.pp-faq-item h3{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;margin-bottom:8px;color:#1A1A1A}
.pp-faq-item p{font-size:14px;color:#1A1A1A;line-height:1.6}
.pp-card{background:#FFFFFF;border:1px solid #E2DDD8;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.04)}
`;

const faqs = [
  {
    question: "How do I post a want?",
    answer: "Tap the + button on the home screen, describe what you're looking for, set your budget, and publish. Sellers in your area will reach out directly."
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings → Account → Delete Account. This will permanently remove your profile and all your posts."
  },
  {
    question: "Is WantBoard free to use?",
    answer: "Yes, WantBoard is free for buyers. You can post wants and receive offers at no cost."
  },
  {
    question: "How do I report a problem?",
    answer: "Email us at boardwant@gmail.com with a description of the issue and we'll get back to you as soon as possible."
  }
];

export default function Support() {
  return (
    <>
      <style>{styles}</style>
      <div className="pp-wrap">
        <a href="/" className="pp-back">← Back to WantBoard</a>
        <div className="pp-card">
          <div className="pp-logo">Want<span>Board</span></div>
          <h1>Support</h1>
          <div className="pp-tagline">Post what you want. Sellers come to you.</div>
          <div className="pp-email">
            Need help? Contact us at <a href="mailto:boardwant@gmail.com">boardwant@gmail.com</a>
          </div>

          <div className="pp-faq">
            {faqs.map((faq, i) => (
              <div key={i} className="pp-faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
