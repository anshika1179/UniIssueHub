import { Link } from 'react-router-dom';

// Inline Icons
const CapIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowUpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const timeline = [
  { title: 'Issue reported', text: 'Description and location received', done: true },
  { title: 'Assigned to maintenance', text: 'The right team has your report', done: true },
  { title: 'Repair in progress', text: 'You can follow every update here', done: false },
];

const steps = [
  {
    no: '01',
    title: 'Tell us what happened',
    text: 'Add a description, location and photo. AI suggests a category and priority, and flags duplicates.',
  },
  {
    no: '02',
    title: 'The right team takes over',
    text: 'Wardens and administrators assign the issue to a technician and update its status.',
  },
  {
    no: '03',
    title: 'Stay in the loop',
    text: 'Follow the resolution timeline and get real-time notifications when something changes.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-sage-50 text-dark overflow-x-clip">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between py-5 border-b border-sage-200">
          <Link to="/" className="flex items-center gap-2 text-sage-900">
            <CapIcon />
            <span className="text-xl font-bold tracking-tight">UniIssueHub</span>
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-sage-900">
            <a href="#how-it-works" className="hover:text-sage-700 transition-colors">How it works</a>
            <Link to="/login" className="inline-flex items-center gap-1 hover:text-sage-700 transition-colors">
              Sign in <ArrowUpRight />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-sage-900">
            <span className="w-2 h-2 rounded-full bg-sage-600" />
            AI-powered campus care
          </p>
          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-sage-900">
            Small issues.
            <br />
            <span className="text-sage-600">Real attention.</span>
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-dark-50 max-w-md">
            The broken tap. The unreliable Wi-Fi. The light that never got fixed. Give every campus issue a place to be heard, tracked and resolved.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link to="/register" className="inline-flex items-center gap-3 bg-sage-900 text-white px-6 py-3.5 rounded-lg font-medium hover:bg-sage-800 transition-colors">
              Report an issue <ArrowRight />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-sage-900 hover:text-sage-700 transition-colors">
              Open your dashboard <ArrowUpRight />
            </Link>
          </div>
          <p className="mt-7 flex items-center gap-2 text-sm text-dark-50">
            <span className="text-sage-700"><ShieldIcon /></span>
            One place for students, wardens and campus teams.
          </p>
        </div>

        {/* Example issue card */}
        <div className="bg-white rounded-xl border border-sage-200 shadow-sm p-6 sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-sage-200">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-dark-50">The campus issue board</span>
            <span className="text-xs text-dark-50">Example</span>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-dark-50"><WrenchIcon /> Maintenance</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cream-300 text-dark-100">In progress</span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-sage-900 max-w-[16rem]">
            A tap that won&apos;t stop leaking.
          </h3>
          <p className="mt-3 flex items-center gap-2 text-sm text-dark-50"><PinIcon /> Block A · Second floor washroom</p>

          <ol className="mt-6">
            {timeline.map((item, i) => (
              <li key={item.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-sage-100 text-sage-800' : 'bg-cream-300 text-dark-100'}`}>
                    {item.done ? <CheckIcon /> : <ClockIcon />}
                  </span>
                  {i < timeline.length - 1 && <span className="w-px flex-1 bg-sage-300 my-1" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold text-sage-900">{item.title}</p>
                  <p className="text-xs text-dark-50 mt-0.5">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-1 pt-4 border-t border-sage-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-sage-100 text-sage-800 font-semibold flex items-center justify-center">M</span>
              <div>
                <p className="text-sm font-semibold text-sage-900">Campus maintenance</p>
                <p className="text-xs text-dark-50">Working on this issue</p>
              </div>
            </div>
            <span className="text-dark-50"><ChatIcon /></span>
          </div>
        </div>
      </section>

      {/* Tagline strip */}
      <section className="border-y border-sage-200 bg-sage-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap justify-center gap-x-12 gap-y-2 text-sm text-dark-50">
          <span>Less chasing updates.</span>
          <span>More getting things fixed.</span>
          <span>A campus that listens.</span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-end">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-sage-700">From report to resolution</p>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-sage-900">
              A clear next step.
              <br />
              At every step.
            </h2>
          </div>
          <p className="text-dark-50 leading-relaxed max-w-md">
            No scattered messages or wondering who to ask. Your report stays in one place from the first description to the final update.
          </p>
        </div>

        {/* Stacked cards: each card sticks near the top while the next one scrolls up and overlaps it */}
        <div className="mt-12 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.no}
              className={`sticky bg-white rounded-xl border border-sage-200 shadow-md p-7 sm:p-10 ${i < steps.length - 1 ? 'mb-[40vh]' : ''}`}
              style={{ top: `${96 + i * 20}px`, zIndex: i + 1 }}
            >
              <span className="text-sm font-semibold text-sage-600">{step.no}</span>
              <h3 className="mt-5 text-xl sm:text-2xl font-semibold text-sage-900">{step.title}</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-dark-50">{step.text}</p>
            </div>
          ))}
          {/* spacer so the stack stays pinned until card 03 has landed */}
          <div className="h-[35vh]" aria-hidden="true" />
        </div>
      </section>

      {/* Final call to action */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="bg-white rounded-xl border border-sage-200 p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-sage-700">Your campus. Your voice.</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-sage-900">Something needs fixing?</h2>
            <p className="mt-2 text-dark-50">Start with a report. Keep track of what happens next.</p>
          </div>
          <Link to="/register" className="inline-flex items-center justify-center gap-3 bg-sage-900 text-white px-6 py-3.5 rounded-lg font-medium hover:bg-sage-800 transition-colors whitespace-nowrap">
            Create an account <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="border-t border-sage-200 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-dark-50">
          <span className="flex items-center gap-2 font-bold text-sage-900"><CapIcon size={18} /> UniIssueHub</span>
          <span>Campus complaint management, with people at the centre.</span>
          <Link to="/login" className="inline-flex items-center gap-1 text-sage-900 hover:text-sage-700">
            Sign in <ArrowUpRight />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
