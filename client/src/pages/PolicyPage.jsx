import { Link } from 'react-router-dom';

const content = {
  terms: {
    title: 'Terms of Service',
    intro: 'UniIssueHub helps students report campus issues and staff manage their resolution.',
    sections: [
      ['Using your account', 'Submit accurate reports, keep your sign-in details private, and do not use the app to harass others or share unrelated personal information. New accounts are students; staff access is assigned by an admin.'],
      ['Complaint handling', 'Campus staff review complaints and assign technicians. Status updates and rule-based AI suggestions help staff work on issues; they do not guarantee a resolution time.'],
      ['Need help?', 'Contact your campus admin for account help or questions about how your campus uses UniIssueHub.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page describes the information used by the UniIssueHub app.',
    sections: [
      ['Information used', 'The app stores account details, complaint descriptions and locations, assignment history, resolution notes, and notifications. Passwords are stored as hashes. Google sign-in uses a Google credential to verify your identity.'],
      ['Who can see complaints', 'Students can view their own complaints. Admins and wardens can review campus complaints. Technicians can view complaints assigned to them. Avoid including sensitive or unrelated personal information in a report.'],
      ['Questions about your data', 'Contact your campus admin about access, corrections, or deletion. Retention and campus-specific data practices depend on the campus deployment; ask your admin for those details.'],
    ],
  },
};

export default function PolicyPage({ type }) {
  const page = content[type];
  return (
    <main className="min-h-screen bg-cream text-dark px-6 py-12">
      <article className="mx-auto max-w-3xl bg-white border border-sage-200 rounded-2xl p-8 sm:p-12 shadow-sm">
        <Link to="/register" className="text-sage-800 font-semibold hover:underline">Back to registration</Link>
        <p className="mt-8 text-sm font-semibold text-sage-700">UniIssueHub</p>
        <h1 className="mt-2 text-3xl font-bold">{page.title}</h1>
        <p className="mt-4 leading-relaxed">{page.intro}</p>
        {page.sections.map(([title, text]) => (
          <section key={title} className="mt-8">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 leading-relaxed text-dark-50">{text}</p>
          </section>
        ))}
        <nav className="mt-10 flex gap-6 border-t border-sage-200 pt-6 text-sage-800">
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </nav>
      </article>
    </main>
  );
}
