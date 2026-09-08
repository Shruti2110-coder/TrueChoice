import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  {
    title: 'One person, one vote',
    body: 'Every ballot is claimed atomically against your Aadhar record, so a double vote is impossible even under a race.',
    icon: (
      <>
        <path d="M12 2.8 4.5 6v5.4c0 4.4 3.1 8.3 7.5 9.5 4.4-1.2 7.5-5.1 7.5-9.5V6L12 2.8Z" />
        <path d="m9 12 2.2 2.2L15.4 10" />
      </>
    )
  },
  {
    title: 'Tamper-evident tally',
    body: 'Counts are incremented server-side only. Nothing the browser sends can inflate a candidate total.',
    icon: (
      <>
        <path d="M4 19.5V9m5.3 10.5V4.5m5.4 15V12M20 19.5V7" />
      </>
    )
  },
  {
    title: 'Results in real time',
    body: 'The live tally updates the moment a ballot lands, so the standings are never more than a refresh old.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.4" />
        <path d="M12 7.4V12l3 2" />
      </>
    )
  }
];

const STATS = [
  { value: '100%', label: 'Verifiable' },
  { value: '1', label: 'Vote each' },
  { value: '<1s', label: 'To cast' },
  { value: '24/7', label: 'Open' }
];

function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="page">
      <header className="hero">
        <span className="pill">
          <span className="pill-dot" />
          Secure &middot; Anonymous &middot; Verifiable
        </span>

        <h1>
          Make your vote
          <br />
          <span className="grad-text">actually count.</span>
        </h1>

        <p>
          TrueChoice is a modern digital ballot box. Register with your Aadhar number, review the
          candidates, and cast a single, tamper-proof vote in seconds.
        </p>

        <div className="hero-actions">
          {isLoggedIn ? (
            <Link to="/vote" className="btn btn-primary btn-lg">
              Go to the ballot
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Register to vote
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                I already have an account
              </Link>
            </>
          )}
        </div>
      </header>

      <section>
        <div className="section-head">
          <span className="eyebrow">Why TrueChoice</span>
          <h2>Built so the count can be trusted</h2>
          <p>Three guarantees the system enforces on the server, not in the browser.</p>
        </div>

        <div className="grid grid-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="card card-hover feature">
              <span className="feature-icon" aria-hidden="true">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.icon}
                </svg>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat-value grad-text">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
