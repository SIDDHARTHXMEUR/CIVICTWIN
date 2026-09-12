import { useState, useEffect } from 'react';

interface SystemClockProps {
  isDark?: boolean;
}

export default function SystemClock({ isDark = true }: SystemClockProps) {
  const [time, setTime] = useState(new Date());
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setColonVisible(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getUTCHours().toString().padStart(2, '0');
  const minutes = time.getUTCMinutes().toString().padStart(2, '0');
  const seconds = time.getUTCSeconds().toString().padStart(2, '0');
  const colon = colonVisible ? ':' : ' ';

  return (
    <span style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '10px',
      fontWeight: 800,
      color: isDark ? '#4fc9dc' : '#005073',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {hours}<span style={{ opacity: colonVisible ? 1 : 0.3 }}>{colon}</span>{minutes}<span style={{ opacity: colonVisible ? 1 : 0.3 }}>{colon}</span>{seconds} <span style={{ fontSize: '8px', color: isDark ? '#6b7280' : '#9ca3af' }}>UTC</span>
    </span>
  );
}
