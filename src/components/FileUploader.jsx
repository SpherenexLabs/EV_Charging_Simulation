import { motion } from 'framer-motion'
import { Upload, FileText, File, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import './FileUploader.css'

function FileUploader({ onFileUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    setUploadedFile(file)
    
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    try {
      let data = null
      
      if (fileExtension === 'csv') {
        data = await parseCSV(file)
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        data = await parseExcel(file)
      } else if (fileExtension === 'pdf') {
        data = await parsePDF(file)
      }
      
      setParsedData(data)
      onFileUpload(data)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please check the file format.')
    }
  }

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  const parsePDF = async (file) => {
    // PDF parsing would require pdfjs-dist
    // For now, returning a placeholder
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'pdf',
          fileName: file.name,
          message: 'PDF parsing is simplified for this demo. In production, implement full PDF text extraction.'
        })
      }, 1000)
    })
  }

  return (
    <motion.div 
      className="card file-uploader"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="card-title">
        <Upload size={24} />
        Data Upload
      </h2>

      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          accept=".csv,.xlsx,.xls,.pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!uploadedFile ? (
          <>
            <FileText size={48} className="upload-icon" />
            <p className="upload-text">
              Drag & drop your file here or
            </p>
            <label htmlFor="file-input" className="upload-button">
              Browse Files
            </label>
            <p className="upload-hint">
              Supports CSV, Excel (.xlsx, .xls), and PDF
            </p>
          </>
        ) : (
          <motion.div 
            className="upload-success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={48} className="success-icon" />
            <p className="success-text">File Uploaded Successfully!</p>
            <div className="file-info">
              <File size={20} />
              <span>{uploadedFile.name}</span>
            </div>
            <label htmlFor="file-input" className="change-button">
              Change File
            </label>
          </motion.div>
        )}
      </div>

      {parsedData && Array.isArray(parsedData) && parsedData.length > 0 && (
        <motion.div 
          className="data-preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="preview-title">Data Preview</h3>
          <div className="preview-stats">
            <div className="stat">
              <span className="stat-label">Rows:</span>
              <span className="stat-value">{parsedData.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Columns:</span>
              <span className="stat-value">
                {Object.keys(parsedData[0] || {}).length}
              </span>
            </div>
          </div>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(parsedData[0] || {}).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default FileUploader
