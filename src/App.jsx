import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  if (!token) {
    return <Login onLoginSuccess={(token, user) => { setToken(token); setUser(user); }} />;
  }

  return <Dashboard token={token} user={user} onLogout={() => { setToken(null); setUser(null); }} />;
}

export default App;