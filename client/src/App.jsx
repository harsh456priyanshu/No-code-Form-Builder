import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import PublicForm from "./pages/PublicForm";


function App() {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center">
      <Routes>
    
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/form/:formId" element={<FormBuilder />} />
          <Route path="/form/:formId/submissions" element={<Submissions />} />
         
        </Route>
       
        <Route path="/public/form/:formId" element={<PublicForm />} />
      </Routes>
    </div>
  );
}

export default App;