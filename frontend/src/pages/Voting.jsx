import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { initials } from '../lib/initials';

function Voting() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [votingFor, setVotingFor] = useState(null);

  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const loadCandidates = useCallback(async () => {
    const { data } = await api.get('/candidate');
    setCandidates(data);
  }, []);

  useEffect(() => {
    let active = true;

    loadCandidates()
      .catch((err) => {
        if (active) setLoadError(errorMessage(err, 'Could not load the ballot.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadCandidates]);

  const castVote = async (candidateId) => {
    if (votingFor) return;

    setVotingFor(candidateId);

    try {
      const { data } = await api.post(`/candidate/vote/${candidateId}`);
      toast(data.message || 'Vote submitted', 'success');

      // Re-read both, so the tally and the "already voted" state come from the server
      await Promise.all([loadCandidates(), refreshProfile()]);
    } catch (err) {
      toast(errorMessage(err, 'Could not record your vote.'), 'error');
      await Promise.all([loadCandidates().catch(() => {}), refreshProfile().catch(() => {})]);
    } finally {
      setVotingFor(null);
    }
  };

  const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);
  const hasVoted = Boolean(user?.isVoted);
  const isAdmin = user?.roles === 'admin';

  return (
    <div className="page">
      <div className="section-head">
        <span className="eyebrow">The ballot</span>
        <h2>Vote your candidate</h2>
        <p>
          {totalVotes === 1 ? '1 vote' : `${totalVotes} votes`} counted so far across{' '}
          {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}.
        </p>
      </div>

      {isAdmin && (
        <div className="banner">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.8v.2" />
          </svg>
          You are signed in as an admin. Admin accounts manage the ballot and cannot vote.
        </div>
      )}

      {!isAdmin && hasVoted && (
        <div className="banner banner-success">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Your vote is locked in. Thanks for taking part - the live tally is below.
        </div>
      )}

      {loading && (
        <div className="candidates">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      )}

      {!loading && loadError && (
        <div className="empty">
          <h3>Ballot unavailable</h3>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && candidates.length === 0 && (
        <div className="empty">
          <h3>No candidates yet</h3>
          <p>An admin has not added anyone to this ballot. Check back shortly.</p>
        </div>
      )}

      {!loading && !loadError && candidates.length > 0 && (
        <div className="candidates">
          {candidates.map((candidate, index) => {
            const votes = candidate.voteCount || 0;
            const share = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
            const isMyChoice = user?.votedFor === candidate._id;
            const busy = votingFor === candidate._id;

            return (
              <article
                key={candidate._id}
                className={`card candidate${isMyChoice ? ' is-choice' : ''}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="candidate-top">
                  <span className="avatar avatar-lg" aria-hidden="true">
                    {initials(candidate.name)}
                  </span>
                  <div>
                    <div className="candidate-name">{candidate.name}</div>
                    <span className="badge">{candidate.party}</span>
                  </div>
                </div>

                <div>
                  <div className="candidate-meta">
                    <span>
                      <strong>{votes}</strong> {votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span>{share}%</span>
                  </div>
                  <div
                    className="bar"
                    role="progressbar"
                    aria-valuenow={share}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${candidate.name} vote share`}
                  >
                    <div className="bar-fill" style={{ width: `${share}%` }} />
                  </div>
                </div>

                {isMyChoice ? (
                  <button type="button" className="btn btn-done btn-block" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Your vote
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-block ${hasVoted || isAdmin ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => castVote(candidate._id)}
                    disabled={hasVoted || isAdmin || Boolean(votingFor)}
                  >
                    {busy && <span className="spinner" />}
                    {busy ? 'Casting...' : `Vote for ${candidate.name.split(' ')[0]}`}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Voting;
