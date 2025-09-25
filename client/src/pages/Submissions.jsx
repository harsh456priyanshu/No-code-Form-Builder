import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';

function Submissions() {
  const { formId } = useParams(); // <-- FIX 1: This line was missing
  const [submissions, setSubmissions] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const formRes = await axios.get(`https://no-code-form-builder.onrender.com/api/forms/${formId}`);
        setFormTitle(formRes.data.title);

        const submissionsRes = await axios.get(`https://no-code-form-builder.onrender.com/api/forms/${formId}/submissions`, {
          headers: { Authorization: `Bearer ${userData.accessToken}` },
        });

        if (Array.isArray(submissionsRes.data)) {
          setSubmissions(submissionsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [formId]);
  
  const handleDownloadCSV = () => {
    if (submissions.length === 0) {
      alert("There are no submissions to download.");
      return;
    }
    const dataForCsv = submissions.map(submission => {
      const row = {};
      submission.responses.forEach(response => {
        row[response.fieldLabel] = response.answer;
      });
      return row;
    });
    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${formTitle}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headers = submissions.length > 0 ? submissions[0].responses.map(res => res.fieldLabel) : [];

  if (loading) return <p className="text-white">Loading submissions...</p>;

  return (
    <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg text-white w-full max-w-6xl mx-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Submissions</h1>
          <p className="text-gray-400">For: {formTitle}</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button onClick={handleDownloadCSV} className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full">
            Download CSV
          </button>
          <Link to="/" className="text-sm bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded w-full text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                {headers.map((header, index) => <th key={index} className="p-3 text-left text-sm font-semibold tracking-wide">{header}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {submissions.map(submission => (
                <tr key={submission._id} className="hover:bg-gray-800">
                  {headers.map((header, index) => { // <-- FIX 2: Use headers to ensure consistent column order
                    const response = submission.responses.find(r => r.fieldLabel === header);
                    return <td key={index} className="p-3 text-sm text-gray-300">{response ? response.answer : ''}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-600 rounded-lg">
          <p>No submissions found for this form yet.</p>
        </div>
      )}
    </div>
  );
}

export default Submissions;