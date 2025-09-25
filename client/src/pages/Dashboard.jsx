import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.accessToken) {
          navigate('/login');
          return;
        }

        const response = await axios.get('https://no-code-form-builder.onrender.com/api/forms', {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
        });

        if (Array.isArray(response.data)) {
          setForms(response.data);
        } else {
          setForms([]);
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error);
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(
        'https://no-code-form-builder.onrender.com/api/forms',
        { title: newFormTitle },
        {
          headers: { Authorization: `Bearer ${userData.accessToken}` },
        }
      );
      const newFormId = response.data._id;
      navigate(`/form/${newFormId}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Could not create the form.');
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form?")) {
      return;
    }
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`https://no-code-form-builder.onrender.com/api/forms/${formId}`, {
        headers: { Authorization: `Bearer ${userData.accessToken}` },
      });
      setForms(forms.filter((form) => form._id !== formId));
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Could not delete the form.');
    }
  };

  const handleCopyLink = (formId) => {
    const link = `${window.location.origin}/public/form/${formId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(formId);
      setTimeout(() => setCopiedId(null), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy link.');
    });
  };

  if (loading) {
    return <div className="text-white text-lg">Loading Dashboard...</div>;
  }

  return (
    <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg text-white w-full max-w-4xl mx-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Your Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 w-full md:w-auto mt-4 md:mt-0 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Logout
        </button>
      </div>
      <div className="mb-8 border-b border-gray-700 pb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Create a New Form 📝</h2>
        <form onSubmit={handleCreateForm} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            placeholder="Enter new form title..."
            className="flex-grow p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Create Form
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Your Forms</h2>
        {Array.isArray(forms) && forms.length > 0 ? (
          <ul className="space-y-4">
            {forms.map((form) => (
              <li key={form._id} className="bg-gray-700 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link to={`/form/${form._id}`} className="font-semibold text-lg hover:text-cyan-400 min-w-0 truncate">
                  {form.title}
                </Link>
                <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
                  <button onClick={() => handleCopyLink(form._id)} className={`text-sm px-3 py-1 rounded transition-colors ${copiedId === form._id ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {copiedId === form._id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link to={`/form/${form._id}/submissions`} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                    Submissions
                  </Link>
                  <button onClick={() => handleDeleteForm(form._id)} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-600 rounded-lg">
            <p>You haven't created any forms yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;