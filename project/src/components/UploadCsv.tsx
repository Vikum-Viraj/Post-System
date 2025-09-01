import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../config/axiosConfig';

interface UploadCsvProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  title?: string;
  endpoint: string;
  acceptedFormats?: string;
  maxFileSize?: number; // in MB
}

const UploadCsv: React.FC<UploadCsvProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  title = "Upload CSV File",
  endpoint,
  acceptedFormats = ".csv",
  maxFileSize = 5
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please select a CSV file (.csv)';
    }

    // Check file size (convert MB to bytes)
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size should be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Prevent modal from closing when clicking inside the drop area
  const handleDropAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Prevent modal from closing when clicking the modal content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle closing modal and clearing file
  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('File uploaded successfully!');
        setSelectedFile(null);
        onClose();
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        toast.error(response.data?.message || 'Upload failed');
      }
    } catch (error: any) {
      let errorMessage = 'Upload failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    isOpen ? (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-xl shadow-xl w-full max-w-lg"
          onClick={handleModalContentClick}
        >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* File Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleDropAreaClick}
              >
            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="space-y-4">
              {selectedFile ? (
                <>
                  <FileText className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <p className="text-sm text-green-600">File ready for upload!</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    disabled={isUploading}
                    className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>Supported format: CSV</p>
                    <p>Maximum file size: {maxFileSize}MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Make sure your CSV file has the correct headers and format. 
              The first row should contain column headers.
            </p>
          </div>
          </div>
        </div>
      </div>
    ) : null
  );
};export default UploadCsv;
