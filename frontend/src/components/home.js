import React from 'react';
import styles from '../styles';
import BotListItem from './botListItem';
import LoadingSpinner from './loadingSpinner';

const Home = ({ bots, loading, isMobile, isDbActive }) => {
  return isDbActive ? (
    <div>
      {loading && isDbActive ? (
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
            <h2>It seems there was a problem getting the bots. Please try again later</h2>
          )}
        </section>
      )}
    </div>
  ) : <></>;
};

export default Home;
