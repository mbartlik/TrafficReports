import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subHours, subDays, startOfHour, addHours } from 'date-fns';

const RouteDurationGraph = ({ routeData, convertDurationStringToTime, convertToUserTimezone }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('24h');

  useEffect(() => {
    const now = new Date();
    let filtered = [];

    switch (filter) {
      case '3h':
        filtered = routeData.filter(data => new Date(data.Time) >= subHours(now, 3));
        break;
      case '24h':
        filtered = routeData.filter(data => new Date(data.Time) >= subHours(now, 24));
        break;
      case '3d':
        filtered = routeData.filter(data => new Date(data.Time) >= subDays(now, 3));
        break;
      case '7d':
        filtered = routeData.filter(data => new Date(data.Time) >= subDays(now, 7));
        break;
      default:
        filtered = routeData;
    }

    // Convert Time field to timestamp
    filtered = filtered.map(data => ({
      ...data,
      Time: new Date(data.Time).getTime()
    }));

    // Sort the data by time
    filtered.sort((a, b) => a.Time - b.Time);

    setFilteredData(filtered);
  }, [filter, routeData]);

  const getTickValues = () => {
    if (filteredData.length === 0) return [];
    const startTime = startOfHour(new Date(filteredData[0].Time));
    const endTime = new Date(filteredData[filteredData.length - 1].Time);
    const tickValues = [];
    let currentTime = startTime;

    while (currentTime <= endTime) {
      tickValues.push(currentTime.getTime());
      currentTime = addHours(currentTime, 1);
    }

    console.log('Tick Values:', tickValues);
    return tickValues;
  };

  const getYAxisTickValues = () => {
    const durations = filteredData.map(data => data.Duration);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const tickValues = [];

    for (let i = Math.ceil(minDuration / 60) * 60; i <= Math.floor(maxDuration / 60) * 60; i += 60) {
      tickValues.push(i);
    }

    console.log('Y-Axis Tick Values:', tickValues);
    return tickValues;
  };

  const formatTick = (time) => {
    const date = new Date(time);
    const formattedTime = convertToUserTimezone(date);
    console.log('Formatted Tick:', formattedTime);
    return formattedTime;
  };

  const formatYAxisTick = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setFilter('3h')} 
          style={{ background: filter === '3h' ? 'blue' : 'none', color: filter === '3h' ? 'white' : 'black', border: '1px solid black', cursor: 'pointer', marginRight: '5px' }}
        >
          Last 3 Hours
        </button>
        <button 
          onClick={() => setFilter('24h')} 
          style={{ background: filter === '24h' ? 'blue' : 'none', color: filter === '24h' ? 'white' : 'black', border: '1px solid black', cursor: 'pointer', marginRight: '5px' }}
        >
          Last 24 Hours
        </button>
        <button 
          onClick={() => setFilter('3d')} 
          style={{ background: filter === '3d' ? 'blue' : 'none', color: filter === '3d' ? 'white' : 'black', border: '1px solid black', cursor: 'pointer', marginRight: '5px' }}
        >
          Last 3 Days
        </button>
        <button 
          onClick={() => setFilter('7d')} 
          style={{ background: filter === '7d' ? 'blue' : 'none', color: filter === '7d' ? 'white' : 'black', border: '1px solid black', cursor: 'pointer' }}
        >
          Last 7 Days
        </button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="Time" 
            tickFormatter={formatTick} 
            ticks={getTickValues()} 
            domain={['dataMin', 'dataMax']}
            scale="time"
            type="number"
          />
          <YAxis 
            dataKey="Duration" 
            tickFormatter={formatYAxisTick} 
            ticks={getYAxisTickValues()} 
            domain={['auto', 'auto']}
            tickCount={10}
          />
          <Tooltip labelFormatter={(time) => formatTick(time)} formatter={convertDurationStringToTime} />
          <Legend />
          <Line type="monotone" dataKey="Duration" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RouteDurationGraph;