import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';



function SortableField({ field, selectedField, setSelectedField, deleteField, renderFieldPreview }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedField(field)}
      className={`p-4 rounded cursor-grab ${selectedField?.id === field.id ? 'bg-gray-900 ring-2 ring-cyan-500' : 'bg-gray-800 hover:bg-gray-900'}`}
    >
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-300 flex-grow">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="ml-4 text-gray-400 hover:text-red-500 font-bold text-xl">&#x2715;</button>
      </div>
      {renderFieldPreview(field)}
    </div>
  );
}

function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/forms/${formId}`);
        if (!response.data.styles) {
          response.data.styles = { backgroundColor: '#111827', textColor: '#FFFFFF', buttonColor: '#0891B2' };
        }
        setForm(response.data);
      } catch (error) { console.error("Failed to fetch form", error); } 
      finally { setLoading(false); }
    };
    fetchForm();
  }, [formId]);
  
  const handleTitleChange = (newTitle) => setForm(prev => ({ ...prev, title: newTitle }));

  const handleStyleChange = (property, value) => {
    setForm(prevForm => ({
      ...prevForm,
      styles: { ...(prevForm.styles || {}), [property]: value },
    }));
  };

  const addField = (template) => {
    const newField = { ...template, id: `field_${Date.now()}`, required: false, placeholder: '' };
    if (["dropdown", "radio", "checkbox"].includes(template.type)) {
      newField.options = ["Option 1"];
    }
    setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    setSelectedField(newField);
  };

  const deleteField = (fieldId) => {
    if (selectedField?.id === fieldId) setSelectedField(null);
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fieldId) }));
  };

  const updateFieldProperty = (fieldId, prop, value) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, [prop]: value } : f)
    }));
    if (selectedField?.id === fieldId) setSelectedField(prev => ({ ...prev, [prop]: value }));
  };
  
  const handleSaveForm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.put(
        `http://localhost:3000/api/forms/${formId}`,
        { title: form.title, fields: form.fields, styles: form.styles },
        { headers: { Authorization: `Bearer ${userData.accessToken}` } }
      );
      alert('Form saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Error saving form.');
    }
  };

  const handleOptionChange = (fieldId, index, value) => {
    const newFields = form.fields.map(f => {
      if (f.id === fieldId) {
        const newOpts = [...(f.options || [])];
        newOpts[index] = value;
        return { ...f, options: newOpts };
      }
      return f;
    });
    setForm(prev => ({ ...prev, fields: newFields }));
    if (selectedField?.id === fieldId) setSelectedField(prev => ({ ...prev, options: newFields.find(f => f.id === fieldId).options }));
  };

  const addOption = (fieldId) => {
    const newFields = form.fields.map(f => {
      if (f.id === fieldId) return { ...f, options: [...(f.options || []), 'New Option'] };
      return f;
    });
    setForm(prev => ({ ...prev, fields: newFields }));
    if (selectedField?.id === fieldId) setSelectedField(prev => ({ ...prev, options: newFields.find(f => f.id === fieldId).options }));
  };
  
  const deleteOption = (fieldId, index) => {
    const newFields = form.fields.map(f => {
      if (f.id === fieldId) return { ...f, options: f.options.filter((_, i) => i !== index) };
      return f;
    });
    setForm(prev => ({ ...prev, fields: newFields }));
    if (selectedField?.id === fieldId) setSelectedField(prev => ({ ...prev, options: newFields.find(f => f.id === fieldId).options }));
  };

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.fields.findIndex(f => f.id === active.id);
        const newIndex = prev.fields.findIndex(f => f.id === over.id);
        return { ...prev, fields: arrayMove(prev.fields, oldIndex, newIndex) };
      });
    }
  };

  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'textarea': return <textarea placeholder={field.placeholder || ''} className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 cursor-not-allowed" readOnly />;
      case 'dropdown': return <select className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 cursor-not-allowed">{field.options?.map((opt, i) => <option key={i}>{opt}</option>)}</select>;
      case 'radio': return <div className="mt-2 space-y-2">{field.options?.map((opt, i) => <div key={i} className="flex items-center"><input type="radio" name={field.id} className="cursor-not-allowed" readOnly checked={i === 0}/><label className="ml-2 text-sm text-gray-300">{opt}</label></div>)}</div>;
      case 'checkbox': return <div className="mt-2 space-y-2">{field.options?.map((opt, i) => <div key={i} className="flex items-center"><input type="checkbox" className="cursor-not-allowed" readOnly/><label className="ml-2 text-sm text-gray-300">{opt}</label></div>)}</div>;
      default: return <input type={field.type} placeholder={field.placeholder || '...'} className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 cursor-not-allowed" readOnly />;
    }
  };
  
  if (loading) return <p className="text-white text-center">Loading form...</p>;
  if (!form) return <p className="text-white text-center">Form not found.</p>;

  return (
    <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg text-white w-full max-w-7xl mx-4 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-600 pb-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Form Builder</h1>
          <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none text-lg p-0 w-full" />
        </div>
        <button onClick={handleSaveForm} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-full md:w-auto">Save Form</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-gray-900 p-4 rounded-lg self-start">
          <h2 className="text-xl font-semibold mb-4">Pre-built Fields</h2>
          <div className="flex flex-col gap-2 mb-6 border-b border-gray-700 pb-6">
            <button onClick={() => addField({ type: 'text', label: 'First Name', required: true, placeholder: 'e.g., John' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">First Name</button>
            <button onClick={() => addField({ type: 'text', label: 'Last Name', required: true, placeholder: 'e.g., Doe' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Last Name</button>
            <button onClick={() => addField({ type: 'email', label: 'Email Address', required: true, placeholder: 'e.g., john.doe@example.com' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Email Address</button>
          </div>
          <h2 className="text-xl font-semibold mb-4">Toolbox</h2>
          <div className="flex flex-col gap-2">
            <button onClick={() => addField({ type: 'text', label: 'New Text Input' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Text Input</button>
            <button onClick={() => addField({ type: 'textarea', label: 'New Text Area' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Text Area</button>
            <button onClick={() => addField({ type: 'number', label: 'New Number Input' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Number Input</button>
            <button onClick={() => addField({ type: 'dropdown', label: 'New Dropdown' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Dropdown</button>
            <button onClick={() => addField({ type: 'checkbox', label: 'New Checkbox Group' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Checkbox Group</button>
            <button onClick={() => addField({ type: 'radio', label: 'New Radio Group' })} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-2 rounded">Radio Group</button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Canvas</h2>
          {form.fields.length > 0 ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={form.fields.map(f => f.id)} strategy={verticalListSortingStrategy}><div className="space-y-4">{form.fields.map((field) => (<SortableField key={field.id} field={field} selectedField={selectedField} setSelectedField={setSelectedField} deleteField={deleteField} renderFieldPreview={renderFieldPreview} />))}</div></SortableContext></DndContext>
          ) : ( <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-500 rounded-lg"><p>Your form is empty.</p><p>Add fields from the toolbox.</p></div> )}
        </div>
        <div className="lg:col-span-1 bg-gray-900 p-4 rounded-lg self-start space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Properties</h2>
            {selectedField ? (<div className="space-y-4"><div><label className="block text-sm font-bold mb-2">Label</label><input type="text" value={selectedField.label || ''} onChange={(e) => updateFieldProperty(selectedField.id, 'label', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>{(['text', 'email', 'number', 'textarea'].includes(selectedField.type)) && (<div><label className="block text-sm font-bold mb-2">Placeholder</label><input type="text" value={selectedField.placeholder || ''} onChange={(e) => updateFieldProperty(selectedField.id, 'placeholder', e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>)}<div className="flex items-center justify-between"><label className="block text-sm font-bold">Required</label><input type="checkbox" checked={selectedField.required || false} onChange={(e) => updateFieldProperty(selectedField.id, 'required', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 text-cyan-600 focus:ring-cyan-500" /></div>{(['dropdown', 'radio', 'checkbox'].includes(selectedField.type)) && (<div><h3 className="text-md font-bold mb-2 mt-4 border-t border-gray-700 pt-4">Options</h3><div className="space-y-2">{(selectedField.options || []).map((option, index) => (<div key={index} className="flex items-center gap-2"><input type="text" value={option || ''} onChange={(e) => handleOptionChange(selectedField.id, index, e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500" /><button onClick={() => deleteOption(selectedField.id, index)} className="text-red-500 hover:text-red-400 font-bold text-xl">&#x2715;</button></div>))}</div><button onClick={() => addOption(selectedField.id)} className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white w-full mt-2 py-1 rounded">Add Option</button></div>)}</div>) : ( <p className="text-gray-400">Select a field to see its properties.</p> )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 border-t border-gray-700 pt-8">Theme</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold mb-2">Background Color</label><input type="color" value={form.styles?.backgroundColor || '#111827'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 rounded cursor-pointer border-none" /></div>
              <div><label className="block text-sm font-bold mb-2">Text Color</label><input type="color" value={form.styles?.textColor || '#FFFFFF'} onChange={(e) => handleStyleChange('textColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 rounded cursor-pointer border-none" /></div>
              <div><label className="block text-sm font-bold mb-2">Button Color</label><input type="color" value={form.styles?.buttonColor || '#0891B2'} onChange={(e) => handleStyleChange('buttonColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 rounded cursor-pointer border-none" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormBuilder;