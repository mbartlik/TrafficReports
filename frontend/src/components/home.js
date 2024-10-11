import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../apiService';

const Home = () => {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botsList = await apiService.listBots();
        setBots(botsList);
      } catch (error) {
        console.error('Error fetching bots:', error);
      }
    };

    fetchBots();
  }, []);

  return (
    <div>
      {/* About section */}
      <section>
        <h2>About</h2>
        <p>This is a website where you can access and create chatbots that have access to live information.</p>
      </section>

      {/* List of bots */}
      <section>
        {bots ? (
          <>
            <h2>Available Bots</h2>
            <ul>
              {bots.map((bot) => (
                <li key={bot.id}>
                  <Link to={`/bot/${bot.id}`}>{bot.title}</Link>
                  <p>{bot.summary}</p>
                </li>
              ))}
            </ul>
          </>
        ) : <h2>It seems there was a problem getting the bots. Please try again later</h2>}
       
      </section>
    </div>
  );
};

export default Home;