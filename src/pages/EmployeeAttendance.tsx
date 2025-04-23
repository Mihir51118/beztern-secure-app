import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Bike } from 'lucide-react';
import Layout from '../components/Layout';
import CameraComponent from '../components/Camera';
import LocationFetcher from '../components/LocationFetcher';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitAttendance } from '../services/attendanceService';

const EmployeeAttendance: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [kilometers, setKilometers] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ photo?: string; location?: string; kilometers?: string }>({});
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: { photo?: string; location?: string; kilometers?: string } = {};
    
    if (!photo) {
      errors.photo = 'Please take a photo';
    }
    
    if (!location) {
      errors.location = 'Please capture your current location';
    }
    
    if (!kilometers.trim()) {
      errors.kilometers = 'Please enter bike kilometer reading';
    } else if (isNaN(Number(kilometers)) || Number(kilometers) < 0) {
      errors.kilometers = 'Please enter a valid kilometer reading';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        await submitAttendance({
          employeeId: user.id,
          employeeName: user.name,
          photo,
          location,
          kilometers: Number(kilometers),
          timestamp: new Date().toISOString()
        });

        showToast('Attendance submitted successfully!', 'success');
        navigate('/shop-visit');
      } catch (error) {
        showToast('Failed to submit attendance', 'error');
        console.error('Error submitting attendance:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout title="Employee Attendance">
      <div className="card animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CameraComponent 
            onCapture={(photoData) => setPhoto(photoData)}
            capturedImage={photo}
            resetImage={() => setPhoto(null)}
            label="Take a photo in company uniform with bike"
          />
          {formErrors.photo && <p className="error-message">{formErrors.photo}</p>}
          
          <LocationFetcher onLocationChange={setLocation} />
          {formErrors.location && <p className="error-message">{formErrors.location}</p>}
          
          <div className="form-group">
            <label htmlFor="kilometers" className="form-label">Bike Kilometer Reading</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Bike className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="kilometers"
                type="number"
                min="0"
                value={kilometers}
                onChange={(e) => setKilometers(e.target.value)}
                className={`input-field pl-10 ${formErrors.kilometers ? 'border-red-500' : ''}`}
                placeholder="Enter current bike reading"
              />
            </div>
            {formErrors.kilometers && <p className="error-message">{formErrors.kilometers}</p>}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Check className="h-5 w-5" />
                <span>Submit Attendance</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeAttendance;