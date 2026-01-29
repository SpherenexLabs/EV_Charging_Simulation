import { motion } from 'framer-motion'
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react'
import './Report.css'

function Report({ metrics, systemConfig, isSimulating }) {
  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toLocaleString(),
      metrics: {
        solarGeneration: metrics.solarGeneration.toFixed(2),
        batteryFlow: metrics.batteryFlow.toFixed(2),
        gridFlow: metrics.gridFlow.toFixed(2),
        evCharging: metrics.evCharging.toFixed(2),
        efficiency: metrics.efficiency.toFixed(1),
      },
      systemConfig: {
        solarCapacity: systemConfig.solarPanelCapacity,
        batteryCapacity: systemConfig.batteryCapacity,
        batterySOC: systemConfig.batterySOC,
        evChargers: systemConfig.numberOfEVChargers,
        gridConnection: systemConfig.gridConnection ? 'Connected' : 'Disconnected',
      }
    }

    return reportData
  }

  const downloadCSV = () => {
    const report = generateReport()
    
    let csvContent = "EV Charging Energy Management System Report\n"
    csvContent += `Generated: ${report.timestamp}\n\n`
    
    csvContent += "Real-Time Metrics\n"
    csvContent += "Metric,Value\n"
    csvContent += `Solar Generation,${report.metrics.solarGeneration} kW\n`
    csvContent += `Battery Flow,${report.metrics.batteryFlow} kW\n`
    csvContent += `Grid Power,${report.metrics.gridFlow} kW\n`
    csvContent += `EV Charging,${report.metrics.evCharging} kW\n`
    csvContent += `System Efficiency,${report.metrics.efficiency}%\n\n`
    
    csvContent += "System Configuration\n"
    csvContent += "Parameter,Value\n"
    csvContent += `Solar Panel Capacity,${report.systemConfig.solarCapacity} kW\n`
    csvContent += `Battery Capacity,${report.systemConfig.batteryCapacity} kWh\n`
    csvContent += `Battery SOC,${report.systemConfig.batterySOC}%\n`
    csvContent += `Number of EV Chargers,${report.systemConfig.evChargers}\n`
    csvContent += `Grid Connection,${report.systemConfig.gridConnection}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `EMS_Report_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadJSON = () => {
    const report = generateReport()
    const jsonContent = JSON.stringify(report, null, 2)
    
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `EMS_Report_${Date.now()}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div 
      className="card report-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <h2 className="card-title">
        <FileText size={24} />
        System Report
      </h2>

      <div className="report-summary">
        <div className="report-section">
          <div className="report-section-title">
            <TrendingUp size={18} />
            Current Performance
          </div>
          <div className="report-stats">
            <div className="report-stat">
              <span className="stat-label">Total Generation</span>
              <span className="stat-value">{metrics.solarGeneration.toFixed(2)} kW</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Total Consumption</span>
              <span className="stat-value">{metrics.evCharging.toFixed(2)} kW</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Grid Usage</span>
              <span className="stat-value">{metrics.gridFlow.toFixed(2)} kW</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Efficiency</span>
              <span className="stat-value highlight">{metrics.efficiency.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="report-section">
          <div className="report-section-title">
            <Calendar size={18} />
            Report Information
          </div>
          <div className="report-info">
            <p className="info-item">
              <span className="info-label">Generated:</span>
              <span className="info-value">{new Date().toLocaleString()}</span>
            </p>
            <p className="info-item">
              <span className="info-label">Status:</span>
              <span className={`info-value status ${isSimulating ? 'active' : 'idle'}`}>
                {isSimulating ? 'Simulation Active' : 'Idle'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <motion.button 
          className="download-btn csv"
          onClick={downloadCSV}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={18} />
          Download CSV
        </motion.button>
        
        <motion.button 
          className="download-btn json"
          onClick={downloadJSON}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={18} />
          Download JSON
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Report
