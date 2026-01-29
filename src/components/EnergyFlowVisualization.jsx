import { motion } from 'framer-motion'
import { Sun, Battery, Grid3x3, Car, Zap, ChevronRight } from 'lucide-react'
import './EnergyFlowVisualization.css'

function EnergyFlowVisualization({ metrics, isSimulating, systemConfig }) {
  const { solarGeneration, batteryFlow, gridFlow, evCharging } = metrics

  return (
    <div className={`card energy-flow ${isSimulating ? 'simulating' : ''}`}>
      <h2 className="card-title">
        <Zap size={24} />
        Energy Flow Visualization
      </h2>

      <div className="flow-dashboard">
        {/* LEFT: Energy Sources */}
        <div className="flow-section sources">
          <div className="section-header">Sources</div>
          
          <motion.div className="flow-card solar" whileHover={{ scale: 1.02 }}>
            <Sun size={32} className="card-icon" />
            <div className="card-info">
              <div className="card-title">Solar</div>
              <div className="card-value">{solarGeneration.toFixed(1)} <span>kW</span></div>
              <div className="card-meta">{systemConfig.solarPanelCapacity} kW Max</div>
            </div>
          </motion.div>

          <motion.div className="flow-card grid" whileHover={{ scale: 1.02 }}>
            <Grid3x3 size={32} className="card-icon" />
            <div className="card-info">
              <div className="card-title">Grid</div>
              <div className="card-value">{gridFlow.toFixed(1)} <span>kW</span></div>
              <div className="card-meta">{systemConfig.gridConnection ? 'Connected' : 'Off'}</div>
            </div>
          </motion.div>
        </div>

        {/* Flow Arrows */}
        <div className="flow-connector">
          {isSimulating && (
            <>
              <motion.div 
                className="flow-particle"
                animate={{ x: [0, 60, 120], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="flow-particle"
                animate={{ x: [0, 60, 120], opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}
          <ChevronRight size={28} className="arrow-icon" />
          <ChevronRight size={28} className="arrow-icon" />
          <ChevronRight size={28} className="arrow-icon" />
        </div>

        {/* CENTER: Storage */}
        <div className="flow-section storage">
          <div className="section-header">Storage</div>
          
          <motion.div className="flow-card battery large" whileHover={{ scale: 1.02 }}>
            <Battery size={36} className="card-icon" />
            <div className="card-info">
              <div className="card-title">Battery</div>
              <div className="card-value">
                {batteryFlow > 0 ? '+' : ''}{batteryFlow.toFixed(1)} <span>kW</span>
              </div>
              <div className="card-meta">{systemConfig.batteryCapacity} kWh</div>
            </div>
            <div className="battery-bar">
              <motion.div 
                className="battery-fill"
                initial={{ width: 0 }}
                animate={{ width: `${systemConfig.batterySOC}%` }}
                transition={{ duration: 1 }}
              />
              <div className="battery-text">{systemConfig.batterySOC}%</div>
            </div>
          </motion.div>
        </div>

        {/* Flow Arrows */}
        <div className="flow-connector">
          {isSimulating && (
            <>
              <motion.div 
                className="flow-particle"
                animate={{ x: [0, 60, 120], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="flow-particle"
                animate={{ x: [0, 60, 120], opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay: 0.7, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}
          <ChevronRight size={28} className="arrow-icon" />
          <ChevronRight size={28} className="arrow-icon" />
          <ChevronRight size={28} className="arrow-icon" />
        </div>

        {/* RIGHT: Load */}
        <div className="flow-section load">
          <div className="section-header">Load</div>
          
          <motion.div className="flow-card ev large" whileHover={{ scale: 1.02 }}>
            <Car size={36} className="card-icon" />
            <div className="card-info">
              <div className="card-title">EV Chargers</div>
              <div className="card-value">{evCharging.toFixed(1)} <span>kW</span></div>
              <div className="card-meta">{systemConfig.numberOfEVChargers} Active</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EnergyFlowVisualization
