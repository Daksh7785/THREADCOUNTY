import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  FileImage, 
  Trash2, 
  AlertCircle,
  Binary,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validate file dimensions and type
  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file format. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setUploadState('idle');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start analysis upload process
  const startUploadAndAnalysis = async () => {
    if (!file || !token) return;

    setError('');
    setUploadState('uploading');
    setProgress(15);

    // Form data
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate incremental upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Upload file to server
      const uploadRes = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(interval);
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload fabric image.');
      }

      setProgress(100);
      
      // Move to "Analyzing" phase
      setUploadState('analyzing');
      setProgress(25);

      // AI Analysis simulation increments
      const analysisInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(analysisInterval);
            return 95;
          }
          return prev + 18;
        });
      }, 400);

      // Call report analyzer endpoint
      const reportRes = await fetch('http://localhost:5000/api/report/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ uploadId: uploadData.upload.id })
      });

      clearInterval(analysisInterval);
      const reportData = await reportRes.json();

      if (!reportRes.ok) {
        throw new Error(reportData.error || 'AI analysis failed.');
      }

      setProgress(100);
      setUploadState('complete');
      
      // Refresh profile to update storage quotes
      await refreshUser();

      // Short delay for user satisfaction before navigating
      setTimeout(() => {
        navigate(`/report/${reportData.report.id}`);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Inspection failed.');
      setUploadState('idle');
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl font-extrabold font-heading">Fabric Swatch Upload</h2>
        <p className="text-xs text-slate-500">
          Upload macro shots of cotton, twill, linen, or denim to analyze thread density and run structure checks.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Container */}
        {uploadState === 'idle' && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]' 
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden" 
            />

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Drag and drop fabric image here</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or click to browse from device</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow shadow-indigo-600/10"
              >
                Choose File
              </button>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Supports: JPG, PNG, JPEG (Max 5MB)
              </div>
            </div>
          </div>
        )}

        {/* Image Preview & Start Analysis Panel */}
        {uploadState === 'idle' && file && previewUrl && (
          <div className="mt-6 glass-panel border rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileImage className="h-10 w-10 text-indigo-500" />
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm truncate max-w-xs sm:max-w-md">{file.name}</h4>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={removeFile}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                title="Remove image"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* Thumbnail Preview Box */}
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative flex items-center justify-center">
              <img src={previewUrl} alt="Fabric preview" className="h-full w-full object-cover" />
            </div>

            <button 
              onClick={startUploadAndAnalysis}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.01]"
            >
              <Binary className="h-4 w-4" />
              <span>Begin AI Thread Analysis</span>
            </button>
          </div>
        )}

        {/* Progress Screen (Uploading & Scanning) */}
        {uploadState !== 'idle' && (
          <div className="glass-panel border rounded-2xl p-8 text-center shadow-xl bg-white dark:bg-slate-900 space-y-6">
            
            {uploadState === 'uploading' && (
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
                <div>
                  <h3 className="font-bold text-lg">Uploading Fabric Swatch...</h3>
                  <p className="text-xs text-slate-500 mt-1">Sending image file securely to ThreadCounty storage.</p>
                </div>
              </div>
            )}

            {uploadState === 'analyzing' && (
              <div className="space-y-6">
                {/* Live scanner mockup */}
                <div className="w-48 h-36 border border-indigo-500/20 rounded-xl mx-auto overflow-hidden relative bg-slate-950 flex items-center justify-center">
                  <img src={previewUrl!} alt="Analyzing preview" className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 analysis-grid-overlay opacity-60"></div>
                  <div className="absolute inset-x-0 scanning-line pointer-events-none"></div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span>AI Analysis in Progress</span>
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Counting threads, assessing warp/weft densities, and classifying weave structures...
                  </p>
                </div>
              </div>
            )}

            {uploadState === 'complete' && (
              <div className="space-y-4 animate-bounce">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Scan Complete!</h3>
                  <p className="text-xs text-slate-500 mt-1">Generating your report files...</p>
                </div>
              </div>
            )}

            {/* Progress Bar Widget */}
            <div className="space-y-2 max-w-sm mx-auto">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    uploadState === 'complete' ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-500">
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadPage;
