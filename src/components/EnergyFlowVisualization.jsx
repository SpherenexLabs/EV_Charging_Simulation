import { motion } from 'framer-motion'
import { Sun, Battery, Grid3x3, Car, Zap, ArrowRight } from 'lucide-react'
import './EnergyFlowVisualization.css'

function EnergyFlowVisualization({ metrics, isSimulating, systemConfig }) {
  const { solarGeneration, batteryFlow, gridFlow, evCharging, mpptEfficiency, dcDcEfficiency, inverterEfficiency } = metrics

  return (
    <div className={`card energy-flow ${isSimulating ? 'simulating' : ''}`}>
      <h2 className="card-title">
        <Zap size={24} />
        Real-Time Energy Flow
      </h2>

      <div className="flow-container">
        {/* SOURCE GENERATION */}
        <div className="flow-column">
          <h3 className="column-title">ENERGY SOURCE</h3>
          
          <motion.div className="component-card solar" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Sun size={32} className="component-icon" />
            <h4 className="component-name">Solar Panel</h4>
            <div className="component-value">{solarGeneration.toFixed(1)}</div>
            <div className="component-unit">kW</div>
            <div className="component-info">{systemConfig.solarPanelCapacity} kW Capacity</div>
          </motion.div>

          <div className="flow-connector">
            {isSimulating && solarGeneration > 0 && (
              <>
                <motion.div
                  className="energy-dot"
                  animate={{ y: [0, 60] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="energy-dot"
                  animate={{ y: [0, 60] }}
                  transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="energy-dot"
                  animate={{ y: [0, 60] }}
                  transition={{ duration: 1.2, delay: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
            <ArrowRight size={28} className="connector-arrow" style={{ transform: 'rotate(90deg)' }} />
          </div>

          <motion.div className="component-card mppt" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Zap size={32} className="component-icon" />
            <h4 className="component-name">MPPT Controller</h4>
            <div className="component-value">{mpptEfficiency.toFixed(1)}</div>
            <div className="component-unit">% Efficiency</div>
            <div className="component-info">Maximum Power Point</div>
          </motion.div>
        </div>

        {/* HORIZONTAL CONNECTOR */}
        <div className="horizontal-connector">
          {isSimulating && solarGeneration > 0 && (
            <>
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, delay: 1, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}
          <div className="connector-line"></div>
          <ArrowRight size={32} className="connector-arrow" />
        </div>

        {/* CONVERSION & STORAGE */}
        <div className="flow-column">
          <h3 className="column-title">CONVERSION & STORAGE</h3>
          
          <motion.div className="component-card converter" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Zap size={32} className="component-icon" />
            <h4 className="component-name">DC/DC Converter</h4>
            <div className="component-value">{dcDcEfficiency.toFixed(1)}</div>
            <div className="component-unit">% Efficiency</div>
            <div className="component-info">Bidirectional</div>
          </motion.div>

          <div className="flow-connector bidirectional">
            {isSimulating && batteryFlow !== 0 && (
              <>
                <motion.div
                  className="energy-dot"
                  animate={{ y: batteryFlow > 0 ? [0, 60] : [60, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="energy-dot"
                  animate={{ y: batteryFlow > 0 ? [0, 60] : [60, 0] }}
                  transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
            <ArrowRight 
              size={28} 
              className="connector-arrow" 
              style={{ 
                transform: batteryFlow > 0 ? 'rotate(90deg)' : 'rotate(-90deg)',
                transition: 'transform 0.5s ease'
              }} 
            />
          </div>

          <motion.div className="component-card battery" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Battery size={32} className="component-icon" />
            <h4 className="component-name">Battery Storage</h4>
            <div className="component-value">{Math.abs(batteryFlow).toFixed(1)}</div>
            <div className="component-unit">kW</div>
            
            <div className="battery-indicator">
              <div className="battery-bar-container">
                <div className="battery-bar-fill" style={{ width: `${systemConfig.batterySOC}%` }}></div>
              </div>
              <span className="battery-percentage">{systemConfig.batterySOC}%</span>
            </div>
            
            <div className={`battery-status-badge ${batteryFlow > 0 ? 'charging' : batteryFlow < 0 ? 'discharging' : 'idle'}`}>
              {batteryFlow > 0 ? '⚡ Charging' : batteryFlow < 0 ? '⚡ Discharging' : '● Standby'}
            </div>
          </motion.div>

          <div className="flow-connector">
            {isSimulating && evCharging > 0 && (
              <>
                <motion.div
                  className="energy-dot"
                  animate={{ y: [0, 60] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="energy-dot"
                  animate={{ y: [0, 60] }}
                  transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
            <ArrowRight size={28} className="connector-arrow" style={{ transform: 'rotate(90deg)' }} />
          </div>

          <motion.div className="component-card inverter" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Zap size={32} className="component-icon" />
            <h4 className="component-name">Inverter</h4>
            <div className="component-value">{inverterEfficiency.toFixed(1)}</div>
            <div className="component-unit">% Efficiency</div>
            <div className="component-info">DC to AC</div>
          </motion.div>
        </div>

        {/* HORIZONTAL CONNECTOR */}
        <div className="horizontal-connector">
          {isSimulating && evCharging > 0 && (
            <>
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="energy-dot horizontal"
                animate={{ x: [0, 60] }}
                transition={{ duration: 1.5, delay: 1, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}
          <div className="connector-line"></div>
          <ArrowRight size={32} className="connector-arrow" />
        </div>

        {/* LOAD CONSUMPTION */}
        <div className="flow-column">
          <h3 className="column-title">LOAD</h3>
          
          <motion.div className="component-card ev" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Car size={32} className="component-icon" />
            <h4 className="component-name">EV Chargers</h4>
            <div className="component-value">{evCharging.toFixed(1)}</div>
            <div className="component-unit">kW</div>
            <div className="component-info">{systemConfig.numberOfEVChargers} Chargers Active</div>
          </motion.div>

          {systemConfig.gridConnection && (
            <>
              <div className="flow-connector">
                {isSimulating && gridFlow > 0 && (
                  <>
                    <motion.div
                      className="energy-dot"
                      animate={{ y: [60, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="energy-dot"
                      animate={{ y: [60, 0] }}
                      transition={{ duration: 1.2, delay: 0.6, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                )}
                <ArrowRight size={28} className="connector-arrow" style={{ transform: 'rotate(-90deg)' }} />
              </div>

              <motion.div className="component-card grid" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Grid3x3 size={32} className="component-icon" />
                <h4 className="component-name">Grid Connection</h4>
                <div className="component-value">{gridFlow.toFixed(1)}</div>
                <div className="component-unit">kW</div>
                <div className="component-info">External Supply</div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnergyFlowVisualization
