import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Voting() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get('http://localhost:8000/candidate');
        setCandidates(res.data.slice(0, 2)); // only 2 candidates
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const voteCandidate = async (id) => {
     
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8000/candidate/vote/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);

      setCandidates(candidates.map(c =>
        c._id === id ? { ...c, voteCount: c.voteCount + 1 } : c
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Error voting');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Vote Your Candidate</h1>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        marginTop: '30px'
      }}>
        {candidates.map(c => (
          <div key={c._id} style={{
            backgroundColor: '#f5f5f5',
            padding: '20px 30px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '200px'
          }}>
            <h2 style={{ marginBottom: '10px' }}>{c.name}</h2>
            <p>Party: {c.party}</p>
            <p>Votes: {c.voteCount || 0}</p>
            <button
              onClick={() => voteCandidate(c._id)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Voting;
