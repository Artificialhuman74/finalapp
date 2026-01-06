import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IncidentReport.css';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

interface FormData {
  who_involved: string;
  incident_type: string;
  location: string;
  impact: string;
  when_occurred: string;
  first_occurrence: string;
  is_anonymous: boolean;
  witness_present: string;
  followup_needed: string;
  additionalInfo: string;
  files: File[];
}

const IncidentReport: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    who_involved: '',
    incident_type: '',
    location: '',
    impact: '',
    when_occurred: '',
    first_occurrence: '',
    is_anonymous: true,
    witness_present: '',
    followup_needed: '',
    additionalInfo: '',
    files: []
  });

  const [step, setStep] = useState(1);
  const [filePreviews, setFilePreviews] = useState<{ url: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev.is_anonymous : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [
            ...prev,
            { url: reader.result as string, name: file.name }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) return; // Prevent premature submission
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== 'files') {
          formDataObj.append(key, String((formData as any)[key]));
        }
      });

      formData.files.forEach((file) => {
        formDataObj.append('files', file);
      });

      const response = await fetch('/api/submit_report', {
        method: 'POST',
        credentials: 'include',
        body: formDataObj
      });

      if (response.ok) {
        setSuccessMessage('Report submitted successfully!');
        setTimeout(() => {
          navigate('/my-reports');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="incident-report-container sylvie-landing">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />
      {/* Privacy Badge */}
      <div className="privacy-alert">
        <span className="privacy-icon">🔒</span>
        <div>
          <strong>Confidential & Anonymous:</strong>
          <p>Your identity and information are protected.</p>
        </div>
      </div>

      <div className="report-form-wrapper">
        <div className="form-header">
          <h2>Incident Report Form</h2>
          <p>Please provide details about the incident. All information is confidential.</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="step-indicator">
            Step {step} of {totalSteps}
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="incident-form">
          {step === 1 && (
            <div className="form-section">
              <h3>Who was involved?</h3>
              <select
                className="form-select"
                name="who_involved"
                value={formData.who_involved}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose an option...</option>
                <option value="family">Family Member</option>
                <option value="strangers">Stranger(s)</option>
                <option value="friends">Friend(s)</option>
                <option value="partner">Partner/Ex-Partner</option>
                <option value="colleagues">Colleague(s)/Classmate(s)</option>
                <option value="authority">Authority Figure</option>
                <option value="others">Others</option>
                <option value="prefer_not_say">Prefer not to say</option>
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <h3>What kind of incident happened?</h3>
              <select
                className="form-select"
                name="incident_type"
                value={formData.incident_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose an option...</option>
                <option value="verbal_abuse">Verbal Abuse/Insults</option>
                <option value="physical_threat">Physical Threat/Violence</option>
                <option value="harassment">Harassment</option>
                <option value="stalking">Stalking/Following</option>
                <option value="online_bullying">Online Bullying/Trolling</option>
                <option value="discrimination">Discrimination</option>
                <option value="assault">Sexual Assault</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <h3>Where did this happen?</h3>
              <input
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Street, workplace, online"
                required
              />
              <h3 style={{ marginTop: '20px' }}>When did this happen?</h3>
              <input
                type="datetime-local"
                className="form-control"
                name="when_occurred"
                value={formData.when_occurred}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {step === 4 && (
            <div className="form-section">
              <h3>How did this incident impact you?</h3>
              <textarea
                className="form-control"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Describe how this incident affected you emotionally, physically, or mentally"
                rows={5}
                required
              />
              <h3 style={{ marginTop: '20px' }}>Was there a witness?</h3>
              <select
                className="form-select"
                name="witness_present"
                value={formData.witness_present}
                onChange={handleInputChange}
              >
                <option value="">Choose...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unsure">Unsure</option>
              </select>
            </div>
          )}

          {step === 5 && (
            <div className="form-section">
              <h3>Additional Information</h3>
              <textarea
                className="form-control"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Any additional details you'd like to share"
                rows={5}
              />

              <h3 style={{ marginTop: '20px' }}>Upload Evidence (Photos, Videos, Documents)</h3>
              <div className="drag-drop-zone">
                <p>📁 Drag and drop files here or click to select</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </div>

              {filePreviews.length > 0 && (
                <div className="file-preview-container">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="file-preview-item">
                      {preview.url.includes('image') ? (
                        <img src={preview.url} alt={preview.name} />
                      ) : (
                        <div className="file-placeholder">📄</div>
                      )}
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={() => removeFile(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="anonymousCheck"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="anonymousCheck">
                  Submit this report anonymously
                </label>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              ← Previous
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.who_involved) ||
                  (step === 2 && !formData.incident_type) ||
                  (step === 3 && (!formData.location || !formData.when_occurred)) ||
                  (step === 4 && !formData.impact)
                }
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </form>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
      </div>
    </div>
  );
};

export default IncidentReport;
