import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


function PublicForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await axios.get(`https://no-code-form-builder.onrender.com/api/forms/${formId}`);
        setForm(data);
      } catch (error) {
        console.error("Failed to fetch form", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);
  
  const handleChange = (fieldId, value, type) => {
    setResponses(prev => {
      if (type === 'checkbox') {
        const existing = prev[fieldId] || [];
        const { name, checked } = value;
        if (checked) {
          return { ...prev, [fieldId]: [...existing, name] };
        } else {
          return { ...prev, [fieldId]: existing.filter(item => item !== name) };
        }
      }
      return { ...prev, [fieldId]: value };
    });
  };


  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!form || !form.fields) return newErrors;
    form.fields.forEach(field => {
      const value = responses[field.id];
      // Required check
      if (field.required) {
        if (field.type === 'checkbox') {
          if (!value || value.length === 0) {
            newErrors[field.id] = 'This field is required.';
          }
        } else if (!value || value === '') {
          newErrors[field.id] = 'This field is required.';
        }
      }
      // Type-specific validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address.';
        }
      }
      if (field.type === 'number' && value) {
        if (isNaN(value)) {
          newErrors[field.id] = 'Please enter a valid number.';
        } else {
          if (field.min !== undefined && Number(value) < field.min) {
            newErrors[field.id] = `Minimum value is ${field.min}.`;
          }
          if (field.max !== undefined && Number(value) > field.max) {
            newErrors[field.id] = `Maximum value is ${field.max}.`;
          }
        }
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmissionStatus('Please fix the errors before submitting.');
      return;
    }
    setSubmissionStatus('Submitting...');
    try {
      const submissionData = form.fields.map(field => ({
        fieldLabel: field.label,
        answer: Array.isArray(responses[field.id]) ? responses[field.id].join(', ') : responses[field.id] || '',
      }));
      await axios.post(`https://no-code-form-builder.onrender.com/api/forms/${formId}/submit`, { responses: submissionData });
      setSubmissionStatus('Your response has been submitted successfully!');
    } catch (error) {
      console.error('Failed to submit response', error);
      setSubmissionStatus('There was an error submitting your response.');
    }
  };

  const renderField = (field) => {
    const baseInputClass = "w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500";
    const inputStyle = {
      backgroundColor: '#4B5563', // A generic dark input background
      color: form.styles?.textColor || '#FFFFFF',
      borderColor: '#6B7280',
    };
    const errorMsg = errors[field.id];

    let inputElement;
    switch (field.type) {
      case 'textarea':
        inputElement = <textarea onChange={(e) => handleChange(field.id, e.target.value)} required={field.required} placeholder={field.placeholder || ''} style={inputStyle} className={baseInputClass} />;
        break;
      case 'dropdown':
        inputElement = (
          <select onChange={(e) => handleChange(field.id, e.target.value)} required={field.required} style={inputStyle} className={baseInputClass}>
            <option value="">Select an option</option>
            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
        break;
      case 'radio':
        inputElement = (
          <div className="mt-2 space-y-2">
            {field.options.map(opt => (
              <label key={opt} className="flex items-center">
                <input type="radio" name={field.id} value={opt} onChange={(e) => handleChange(field.id, e.target.value)} required={field.required} className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500" style={{accentColor: form.styles?.buttonColor}}/>{opt}
              </label>
            ))}
          </div>
        );
        break;
      case 'checkbox':
        inputElement = (
          <div className="mt-2 space-y-2">
            {field.options.map(opt => (
              <label key={opt} className="flex items-center">
                <input type="checkbox" name={opt} onChange={(e) => handleChange(field.id, { name: e.target.name, checked: e.target.checked }, 'checkbox')} className="mr-2 h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500" style={{accentColor: form.styles?.buttonColor}}/>{opt}
              </label>
            ))}
          </div>
        );
        break;
      default:
        inputElement = <input type={field.type} onChange={(e) => handleChange(field.id, e.target.value)} required={field.required} placeholder={field.placeholder || ''} style={inputStyle} className={baseInputClass} />;
    }
    return (
      <>
        {inputElement}
        {errorMsg && <div className="text-red-400 text-xs mt-1">{errorMsg}</div>}
      </>
    );
  };

  if (loading) return <div className="text-white text-lg">Loading form...</div>;
  if (!form) return <div className="text-white text-lg">Form not found or has been deleted.</div>;

  if (submissionStatus.includes('successfully')) {
    return (
      <div className="p-8 rounded-lg shadow-lg w-full max-w-2xl mx-4 text-center" style={{ backgroundColor: form.styles?.backgroundColor, color: form.styles?.textColor }}>
        <h2 className="text-3xl font-bold">{submissionStatus}</h2>
      </div>
    );
  }

  return (
    <div 
      className="p-4 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-4"
      style={{ 
        backgroundColor: form.styles?.backgroundColor || '#111827',
        color: form.styles?.textColor || '#FFFFFF'
      }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">{form.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map(field => (
          <div key={field.id}>
            <label className="block text-sm font-bold mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
        <button type="submit" disabled={submissionStatus === 'Submitting...'} className="w-full font-bold py-2 px-4 rounded transition-colors" style={{ backgroundColor: form.styles?.buttonColor || '#0891B2', color: form.styles?.textColor === form.styles?.buttonColor ? '#000000' : '#FFFFFF' }}>
          {submissionStatus === 'Submitting...' ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default PublicForm;