// FileUploadSearch.jsx - Upload local audio files
import React, { useState, useRef } from 'react';
import { MusicalNoteIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';

const FileUploadSearch = ({ onResultSelect }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.wav') ||
      file.name.endsWith('.ogg') ||
      file.name.endsWith('.m4a')
    );

    const fileResults = audioFiles.map((file, index) => {
      const url = URL.createObjectURL(file);
      return {
        id: `local_${Date.now()}_${index}`,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        artist: 'Local File',
        duration: '—', // Will be set when loaded
        thumbnail: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect fill='%2310B981' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='60' fill='white'%3E🎵%3C/text%3E%3C/svg%3E`,
        source: 'local',
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        views: 'Local',
        isStreamable: true
      };
    });

    setSelectedFiles(fileResults);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Upload Button */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={handleUploadClick}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all duration-300 font-semibold text-white shadow-lg flex items-center justify-center space-x-3"
        >
          <CloudArrowUpIcon className="w-6 h-6" />
          <span>Upload MP3/Audio Files (All Effects Will Work!)</span>
        </button>
        
        <p className="text-xs text-white/60 text-center mt-2">
          Supported: MP3, WAV, OGG, M4A • All audio effects fully functional
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-green-400 font-medium">✨ Full Audio Effects Available!</p>
            <p className="text-xs text-white/60 mt-1">
              Upload your own MP3 files and transform them with <span className="text-green-300 font-medium">Lo-Fi, EDM, Bass Boost, 8D Audio, Slowed, Nightcore</span>, and more. No CORS restrictions!
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFiles.map((file) => (
            <div
              key={file.id}
              className="relative flex gap-2 p-2 rounded-lg border border-green-500/30 hover:border-green-500 transition-colors group bg-white/5"
            >
              <div 
                className="relative cursor-pointer" 
                onClick={() => {
                  onResultSelect(file);
                }}
              >
                <img
                  src={file.thumbnail}
                  alt={file.title}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <MusicalNoteIcon className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-2 text-white">{file.title}</h3>
                <p className="text-white/60">{file.artist}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-400">Local File</span>
                  <span className="text-white/50">{(file.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
          <CloudArrowUpIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-2">No files selected</p>
          <p className="text-xs text-white/30">Click the button above to upload audio files</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadSearch;
