import React, { useState } from 'react';
import { Check, Store, Mail, User, HelpCircle } from 'lucide-react';
import Layout from '../components/Layout';
import CameraComponent from '../components/Camera';
import LocationFetcher from '../components/LocationFetcher';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitShopVisit } from '../services/shopVisitService';

const ShopVisit: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [visitSuccessful, setVisitSuccessful] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    photo?: string;
    location?: string;
    ownerName?: string;
    ownerEmail?: string;
    visitSuccessful?: string;
  }>({});
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const validateForm = (): boolean => {
    const errors: {
      photo?: string;
      location?: string;
      ownerName?: string;
      ownerEmail?: string;
      visitSuccessful?: string;
    } = {};
    
    if (!photo) {
      errors.photo = 'Please take a photo of the shop';
    }
    
    if (!location) {
      errors.location = 'Please capture your current location';
    }
    
    if (!ownerName.trim()) {
      errors.ownerName = 'Shop owner name is required';
    }
    
    if (!ownerEmail.trim()) {
      errors.ownerEmail = 'Shop owner email is required';
    } else if (!/\S+@\S+\.\S+/.test(ownerEmail)) {
      errors.ownerEmail = 'Please enter a valid email address';
    }
    
    if (!visitSuccessful) {
      errors.visitSuccessful = 'Please select an option';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        await submitShopVisit({
          employeeId: user.id,
          employeeName: user.name,
          photo,
          location,
          ownerName,
          ownerEmail,
          visitSuccessful: visitSuccessful === 'yes',
          timestamp: new Date().toISOString()
        });

        // Generate and download Excel
        // This would be handled by the backend
        showToast('Shop visit data submitted successfully!', 'success');
        
        // Reset form
        setPhoto(null);
        setLocation(null);
        setOwnerName('');
        setOwnerEmail('');
        setVisitSuccessful('');
      } catch (error) {
        showToast('Failed to submit shop visit data', 'error');
        console.error('Error submitting shop visit:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout title="Shop Visit Verification">
      <div className="card animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CameraComponent 
            onCapture={(photoData) => setPhoto(photoData)}
            capturedImage={photo}
            resetImage={() => setPhoto(null)}
            label="Take a photo of the shop"
          />
          {formErrors.photo && <p className="error-message">{formErrors.photo}</p>}
          
          <LocationFetcher onLocationChange={setLocation} />
          {formErrors.location && <p className="error-message">{formErrors.location}</p>}
          
          <div className="form-group">
            <label htmlFor="ownerName" className="form-label">Shop Owner Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={`input-field pl-10 ${formErrors.ownerName ? 'border-red-500' : ''}`}
                placeholder="Enter shop owner name"
              />
            </div>
            {formErrors.ownerName && <p className="error-message">{formErrors.ownerName}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="ownerEmail" className="form-label">Shop Owner Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="ownerEmail"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className={`input-field pl-10 ${formErrors.ownerEmail ? 'border-red-500' : ''}`}
                placeholder="Enter shop owner email"
              />
            </div>
            {formErrors.ownerEmail && <p className="error-message">{formErrors.ownerEmail}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label flex items-center space-x-1">
              <HelpCircle className="h-4 w-4 text-gray-500" />
              <span>Was the visit successful?</span>
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="yes"
                  name="visitSuccessful"
                  type="radio"
                  value="yes"
                  checked={visitSuccessful === 'yes'}
                  onChange={() => setVisitSuccessful('yes')}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="yes" className="ml-3 block text-sm font-medium text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="no"
                  name="visitSuccessful"
                  type="radio"
                  value="no"
                  checked={visitSuccessful === 'no'}
                  onChange={() => setVisitSuccessful('no')}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="no" className="ml-3 block text-sm font-medium text-gray-700">
                  No
                </label>
              </div>
            </div>
            {formErrors.visitSuccessful && <p className="error-message">{formErrors.visitSuccessful}</p>}
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
                <span>Submit Shop Visit</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ShopVisit;