'use client'

import React, { useState, useEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import Modal from './Modal';
import { PlusIcon } from '@heroicons/react/20/solid';


export default function Home() {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState("");


  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://roadmap-vote-df21307c8941.herokuapp.com/');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        setFeatures(data.data.features);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

//get sessionid
function getSessionId() {
  let sessionId = sessionStorage.getItem('sessionId');

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }

  return sessionId;
}

function generateSessionId() {
  return 'ss-' + new Date().getTime() + '-' + Math.random().toString(36);
}


//handle vote
  function handleVote(featureId) {
    const sessionId = getSessionId();

    fetch('https://roadmap-vote-df21307c8941.herokuapp.com/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featureId, sessionId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            setShowConfetti(true);
            setTimeout(() => {
              setShowConfetti(false)
            }, 3000);
            setFeatures(prevFeatures => 
                prevFeatures.map(f => 
                    f._id === featureId ? { ...f, votes: f.votes + 1 } : f
                )
            );
        } else {
            alert(data.message); 
        }
    })
    .catch(error => {
        console.error('Error voting:', error);
    });
  }

  return (
    <main className="px-4 py-8 bg-gray-900">
      {showConfetti && <Confetti width={width} height={height} />}
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} details={modalDetails} />}
  
      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4 text-white">Roadmap</h1>
        <a href="mailto:team@myfana.com?subject=Suggestion for a Feature" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Suggest a Feature
        </a>
      </div>
  
      {/* Pending Features Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Pending Features</h2>
        <ul role="list" className="divide-y divide-gray-800">
          {features.filter(feature => feature.status !== "Completed").map((feature) => (
            <li key={feature._id} className="flex justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <img className="h-12 w-12 flex-none rounded-full bg-gray-800" src={feature.content} alt={feature.title} onClick={() => {setModalDetails(feature.details); setIsModalOpen(true)}} />
                <div className="min-w-0 flex-auto">
                  <h3 className="text-sm font-semibold leading-6 text-white">{feature.title}</h3>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-400">{feature.description}</p>
                </div>
              </div>
              <div className="flex flex-col shrink-0 sm:items-end">
                <p className="text-sm leading-6 text-white">{feature.votes} Votes 🙌</p>
                <button className="mt-2 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600" onClick={() => handleVote(feature._id)}>
                  Vote
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
  
      {/* Completed Features Section */}
      <section>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">Completed Features</h2>
        <ul role="list" className="divide-y divide-gray-800">
          {features.filter(feature => feature.status === "Completed").map((feature) => (
            <li key={feature._id} className="flex justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <img className="h-12 w-12 flex-none rounded-full bg-gray-800" src={feature.content} alt={feature.title} onClick={() => {setModalDetails(feature.details); setIsModalOpen(true)}} />
                <div className="min-w-0 flex-auto">
                  <h3 className="text-sm font-semibold leading-6 text-white">{feature.title}</h3>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-400">{feature.description}</p>
                </div>
              </div>
              <div className="flex flex-col shrink-0 sm:items-end">
                <p className="text-sm leading-6 text-white">{feature.votes} Votes 🙌</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
  
}
