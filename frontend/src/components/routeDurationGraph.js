import React, { useState, useEffect } from 'react';
import styles from '../styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subHours, subDays } from 'date-fns';

const RouteDurationGraph = ({ routeData, convertDurationStringToTime, convertToUserTimezone }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('24h');

  useEffect(() => {
    const now = new Date();
    const filterMap = {
      '3h': subHours(now, 3),
      '24h': subHours(now, 24),
      '3d': subDays(now, 3),
      '7d': subDays(now, 7),
      '30d': subDays(now, 30),
    };
    const filtered = routeData
      .filter(data => new Date(data.Time) >= (filterMap[filter] || now))
      .map(data => ({ ...data, Time: new Date(data.Time).getTime() }))
      .sort((a, b) => a.Time - b.Time);

    setFilteredData(filtered);
  }, [filter, routeData]);

  const getAvailableFilters = () => {
    if (routeData.length === 0) return [];
    const earliestTime = new Date(Math.min(...routeData.map(data => new Date(data.Time).getTime())));
    const now = new Date();
    const availableFilters = [];

    // "Last 3 Hours" filter is always available
    availableFilters.push({ label: 'Last 3 Hours', value: '3h' });

    // Check if there is more data than the next smallest filter can cover
    if (now - earliestTime > 3 * 60 * 60 * 1000) availableFilters.push({ label: 'Last 24 Hours', value: '24h' });
    if (now - earliestTime > 24 * 60 * 60 * 1000) availableFilters.push({ label: 'Last 3 Days', value: '3d' });
    if (now - earliestTime > 3 * 24 * 60 * 60 * 1000) availableFilters.push({ label: 'Last 7 Days', value: '7d' });
    if (now - earliestTime > 7 * 24 * 60 * 60 * 1000) availableFilters.push({ label: 'Last 30 Days', value: '30d' });

    return availableFilters;
};

  const getYAxisTickValues = () => {
    const durations = filteredData.map(data => data.Duration);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const tickValues = [];

    for (let i = Math.floor(minDuration / 60); i <= Math.ceil(maxDuration / 60); i++) {
      tickValues.push(i * 60);
    }

    return tickValues.length <= 3
      ? tickValues.flatMap(value => [value, value + 30].filter(v => v <= maxDuration))
      : tickValues;
  };

  const getXAxisTicks = () => {
    if (filteredData.length === 0) return [];
    const latestTime = filteredData[filteredData.length - 1].Time;
    const ticks = [];
    const hour = 3600000; // milliseconds in an hour

    switch (filter) {
      case '3h':
        for (let i = 3; i >= 1; i--) {
          ticks.push(latestTime - i * hour);
        }
        break;
      case '24h':
        for (let i = 4; i >= 1; i--) {
          ticks.push(latestTime - i * 6 * hour);
        }
        break;
      case '3d':
        for (let i = 3; i >= 1; i--) {
          ticks.push(latestTime - i * 24 * hour);
        }
        break;
      case '7d':
        for (let i = 3; i >= 1; i--) {
          ticks.push(latestTime - i * 2 * 24 * hour);
        }
        break;
      case '30d':
        for (let i = 5; i >= 1; i--) {
          ticks.push(latestTime - i * 6 * 24 * hour);
        }
        break;
      default:
        break;
    }
    ticks.push(latestTime);
    return ticks;
  };

  const formatTick = time => convertToUserTimezone(new Date(time));

  const formatYAxisTick = duration => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds || (!hours && !minutes) ? `${seconds}s` : ''}`.trim();
  };

  const availableFilters = getAvailableFilters();

  const Button = ({ label, value }) => (
    <button
      onClick={() => setFilter(value)}
      style={{
        ...styles.standardButton,
        background: filter === value ? 'rgb(79, 98, 114)' : 'none',
        color: filter === value ? 'white' : 'black',
        border: '1px solid black',
        cursor: 'pointer',
        marginRight: '5px'
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {availableFilters.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          {availableFilters.map(({ label, value }) => (
            <Button key={value} label={label} value={value} />
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Time"
            tickFormatter={formatTick}
            ticks={getXAxisTicks()}
            domain={[() => Math.min(...filteredData.map(data => data.Time)), 'dataMax']}
            scale="time"
            type="number"
            allowDataOverflow
          />
          <YAxis
            dataKey="Duration"
            tickFormatter={formatYAxisTick}
            ticks={getYAxisTickValues()}
            domain={['auto', 'auto']}
            tickCount={10}
          />
          <Tooltip labelFormatter={formatTick} formatter={convertDurationStringToTime} />
          <Legend />
          <Line type="monotone" dataKey="Duration" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RouteDurationGraph;