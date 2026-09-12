const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getApiBaseUrl();

export async function getDeviceToken() {
  let deviceHash = localStorage.getItem('civictwin_device_hash');
  if (!deviceHash) {
    deviceHash = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('civictwin_device_hash', deviceHash);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_hash: deviceHash })
    });
    if (res.ok) {
      const data = await res.json();
      return { deviceHash, token: data.access_token };
    }
  } catch (err) {
    console.warn('Backend API connection warning:', err);
  }
  return { deviceHash, token: null };
}

export async function submitReport(reportData) {
  const { deviceHash } = await getDeviceToken();

  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_hash: deviceHash,
      raw_text: reportData.raw_text,
      photo_urls: reportData.photo_urls || [],
      latitude: reportData.latitude,
      longitude: reportData.longitude
    })
  });

  if (!response.ok) {
    throw new Error('Failed to submit report. Please check server connection.');
  }

  return await response.json();
}

export async function fetchReportStatus(reportId) {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch report status');
  }
  return await response.json();
}

export async function fetchNearbyIncidents() {
  try {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Failed to fetch incidents:', err);
  }
  return [];
}
