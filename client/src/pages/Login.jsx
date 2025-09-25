import { useState } from 'react';
import axios from 'axios';
import { useNavigate ,  Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });
      
    
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/'); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Login failed. Please check credentials.';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm mx-4">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Log In
        </button>
        {error && <p className="text-red-500 text-xs italic mt-4 text-center">{error}</p>}
      </form>
      <p className="text-center text-gray-400 text-xs mt-6">
        Don't have an account?&nbsp;
        <Link to="/register" className="text-cyan-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default Login;