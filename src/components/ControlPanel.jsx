import { motion } from 'framer-motion'
import { Play, Square, Settings, Cloud, Thermometer, Wind, Sun } from 'lucide-react'
import './ControlPanel.css'

function ControlPanel({
  environmentalData,
  setEnvironmentalData,
  systemConfig,
  setSystemConfig,
  isSimulating,
  onStartSimulation,
  onStopSimulation,
  hasUploadedData,
}) {
  const handleEnvironmentalChange = (key, value) => {
    setEnvironmentalData(prev => ({ ...prev, [key]: parseFloat(value) }))
  }

  const handleSystemChange = (key, value) => {
    setSystemConfig(prev => ({ ...prev, [key]: typeof value === 'boolean' ? value : parseFloat(value) }))
  }

  return (
    <motion.div 
      className="card control-panel"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <h2 className="card-title">
        <Settings size={24} />
        Control Panel
      </h2>

      <div className="section">
        <h3 className="section-title">
          <Cloud size={20} />
          Environmental Conditions
        </h3>

        <div className="input-group">
          <label>
            <Sun size={16} className="inline-icon" />
            Solar Irradiance (W/m²)
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={environmentalData.solarIrradiance}
            onChange={(e) => handleEnvironmentalChange('solarIrradiance', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>0 W/m²</span>
            <span className="current-value">{environmentalData.solarIrradiance} W/m²</span>
            <span>1000 W/m²</span>
          </div>
        </div>

        <div className="input-group">
          <label>
            <Thermometer size={16} className="inline-icon" />
            Temperature (°C)
          </label>
          <input
            type="range"
            min="-10"
            max="50"
            step="1"
            value={environmentalData.temperature}
            onChange={(e) => handleEnvironmentalChange('temperature', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>-10°C</span>
            <span className="current-value">{environmentalData.temperature}°C</span>
            <span>50°C</span>
          </div>
        </div>

        <div className="input-group">
          <label>
            <Cloud size={16} className="inline-icon" />
            Cloud Cover (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={environmentalData.cloudCover}
            onChange={(e) => handleEnvironmentalChange('cloudCover', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>0%</span>
            <span className="current-value">{environmentalData.cloudCover}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="input-group">
          <label>
            <Wind size={16} className="inline-icon" />
            Wind Speed (m/s)
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={environmentalData.windSpeed}
            onChange={(e) => handleEnvironmentalChange('windSpeed', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>0 m/s</span>
            <span className="current-value">{environmentalData.windSpeed} m/s</span>
            <span>30 m/s</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">System Configuration</h3>

        <div className="input-group">
          <label>Solar Panel Capacity (kW)</label>
          <input
            type="number"
            min="10"
            max="500"
            value={systemConfig.solarPanelCapacity}
            onChange={(e) => handleSystemChange('solarPanelCapacity', e.target.value)}
            disabled={isSimulating}
          />
        </div>

        <div className="input-group">
          <label>Battery Capacity (kWh)</label>
          <input
            type="number"
            min="50"
            max="1000"
            value={systemConfig.batteryCapacity}
            onChange={(e) => handleSystemChange('batteryCapacity', e.target.value)}
            disabled={isSimulating}
          />
        </div>

        <div className="input-group">
          <label>Battery State of Charge (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={systemConfig.batterySOC}
            onChange={(e) => handleSystemChange('batterySOC', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>0%</span>
            <span className="current-value">{systemConfig.batterySOC}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="input-group">
          <label>Number of EV Chargers</label>
          <input
            type="number"
            min="1"
            max="20"
            value={systemConfig.numberOfEVChargers}
            onChange={(e) => handleSystemChange('numberOfEVChargers', e.target.value)}
            disabled={isSimulating}
          />
        </div>

        <div className="input-group">
          <label>EV Charging Demand (kW)</label>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={systemConfig.evChargingDemand}
            onChange={(e) => handleSystemChange('evChargingDemand', e.target.value)}
            disabled={isSimulating}
          />
          <div className="value-display">
            <span>0 kW</span>
            <span className="current-value">{systemConfig.evChargingDemand} kW</span>
            <span>200 kW</span>
          </div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="gridConnection"
            checked={systemConfig.gridConnection}
            onChange={(e) => handleSystemChange('gridConnection', e.target.checked)}
            disabled={isSimulating}
          />
          <label htmlFor="gridConnection">Grid Connection Enabled</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="mlOptimization"
            checked={systemConfig.mlOptimization}
            onChange={(e) => handleSystemChange('mlOptimization', e.target.checked)}
            disabled={isSimulating}
          />
          <label htmlFor="mlOptimization">ML/DL Optimization</label>
        </div>
      </div>

      <div className="control-buttons">
        {hasUploadedData && (
          <div className="data-badge">
            <span className="source-dot"></span>
            Using Uploaded Data
          </div>
        )}
        
        {!isSimulating ? (
          <motion.button
            className="button button-primary"
            onClick={onStartSimulation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={20} />
            Start Simulation
          </motion.button>
        ) : (
          <motion.button
            className="button button-secondary"
            onClick={onStopSimulation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Square size={20} />
            Stop Simulation
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default ControlPanel
