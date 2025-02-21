import React from 'react';
import styles from '../styles';
import BotListItem from './botListItem';
import LoadingSpinner from './loadingSpinner';

const Home = ({ bots, loading, isMobile, isDbActive }) => {
  if (!isDbActive) {
    return <h2>The database is currently unavailable. Please try again later.</h2>;
  }

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <section>
          {bots.length > 0 ? (
            <>
              <h2 style={isMobile ? styles.mobileHeader : {}}>Featured Bots</h2>
              <ul style={isMobile ? styles.mobileList : {}}>
                {bots.map((bot) => (
                  <BotListItem key={bot.id} bot={bot} linkPath={`/bot/${bot.id}`} isMobile={isMobile} />
                ))}
              </ul>
            </>
          ) : (
            <h2>No bots available at the moment. Please try again later.</h2>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
