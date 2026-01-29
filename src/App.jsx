import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import EnergyFlowVisualization from './components/EnergyFlowVisualization'
import Dashboard from './components/Dashboard'
import FileUploader from './components/FileUploader'
import SimulationResults from './components/SimulationResults'
import Report from './components/Report'
import { simulateEMS } from './utils/emsEngine'
import './App.css'

function App() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [environmentalData, setEnvironmentalData] = useState({
    solarIrradiance: 800, // W/m²
    temperature: 25, // °C
    cloudCover: 20, // %
    windSpeed: 5, // m/s
  })
  const [systemConfig, setSystemConfig] = useState({
    solarPanelCapacity: 100, // kW
    batteryCapacity: 200, // kWh
    batterySOC: 80, // %
    numberOfEVChargers: 4,
    evChargingDemand: 50, // kW
    gridConnection: true,
    mlOptimization: true,
  })
  const [uploadedData, setUploadedData] = useState(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    solarGeneration: 0,
    batteryFlow: 0,
    gridFlow: 0,
    evCharging: 0,
    efficiency: 0,
  })

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      if (isSimulating) {
        updateRealTimeMetrics()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isSimulating, environmentalData, systemConfig])

  const updateRealTimeMetrics = () => {
    const solarGeneration = calculateSolarGeneration()
    const evCharging = systemConfig.evChargingDemand
    
    // Calculate energy balance
    const { batteryFlow, gridFlow } = calculateEnergyBalance(solarGeneration, evCharging)
    
    const efficiency = calculateEfficiency(solarGeneration, evCharging)

    setRealTimeMetrics({
      solarGeneration,
      batteryFlow,
      gridFlow,
      evCharging,
      efficiency,
    })
  }

  const calculateSolarGeneration = () => {
    const { solarIrradiance, temperature, cloudCover } = environmentalData
    const { solarPanelCapacity } = systemConfig
    
    const tempCoefficient = 1 - (temperature - 25) * 0.004
    const cloudFactor = 1 - (cloudCover / 100) * 0.7
    const efficiency = 0.20 * tempCoefficient * cloudFactor
    
    return (solarIrradiance / 1000) * solarPanelCapacity * efficiency
  }

  const calculateEnergyBalance = (solarGen, evDemand) => {
    const soc = systemConfig.batterySOC
    const gridConnected = systemConfig.gridConnection
    
    let batteryFlow = 0
    let gridFlow = 0
    
    // Case 1: Solar exceeds demand - charge battery with excess
    if (solarGen > evDemand) {
      const excess = solarGen - evDemand
      if (soc < 95) {
        batteryFlow = Math.min(excess, systemConfig.batteryCapacity * 0.5) // Charging (positive)
      }
    }
    // Case 2: Solar less than demand - discharge battery or use grid
    else if (solarGen < evDemand) {
      const deficit = evDemand - solarGen
      
      // Try to cover deficit with battery
      if (soc > 20) {
        const maxDischarge = systemConfig.batteryCapacity * 0.5
        const batteryContribution = Math.min(deficit, maxDischarge)
        batteryFlow = -batteryContribution // Discharging (negative)
        
        // If battery can't cover full deficit, use grid
        const remainingDeficit = deficit - batteryContribution
        if (remainingDeficit > 0 && gridConnected) {
          gridFlow = remainingDeficit
        }
      }
      // Battery too low, use grid for full deficit
      else if (gridConnected) {
        gridFlow = deficit
      }
    }
    
    return { batteryFlow, gridFlow }
  }

  const calculateBatteryFlow = () => {
    const solarGen = calculateSolarGeneration()
    const demand = systemConfig.evChargingDemand
    const soc = systemConfig.batterySOC
    
    if (solarGen > demand && soc < 95) {
      return (solarGen - demand) * 0.9 // Charging
    } else if (solarGen < demand && soc > 20) {
      return -(demand - solarGen) * 0.95 // Discharging
    }
    return 0
  }

  const calculateGridFlow = () => {
    if (!systemConfig.gridConnection) return 0
    
    const solarGen = calculateSolarGeneration()
    const demand = systemConfig.evChargingDemand
    const batteryFlow = calculateBatteryFlow()
    
    // Available power from solar and battery (battery discharging is negative, so subtract it)
    const availablePower = solarGen - batteryFlow
    
    // If demand exceeds available power, grid must supply the difference
    const netDemand = demand - availablePower
    return netDemand > 0 ? netDemand : 0
  }

  const calculateEfficiency = (generation, consumption) => {
    if (consumption === 0) return 100
    const efficiency = (generation / consumption) * 100
    return Math.min(efficiency, 100)
  }

  const handleStartSimulation = async () => {
    setIsSimulating(true)
    
    // Run simulation with uploaded data or default parameters
    const simulationParams = {
      ...environmentalData,
      ...systemConfig,
      uploadedData,
      duration: 24, // 24 hours
    }

    const results = await simulateEMS(simulationParams)
    setSimulationData(results)
  }

  const handleStopSimulation = () => {
    setIsSimulating(false)
  }

  const handleFileUpload = (data) => {
    setUploadedData(data)
  }

  return (
    <div className="app">
      <Header />

      <div className="page">
        <motion.section
          className="hero"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <EnergyFlowVisualization
            metrics={realTimeMetrics}
            isSimulating={isSimulating}
            systemConfig={systemConfig}
          />
        </motion.section>

        <div className="content-grid">
          <motion.section
            className="left-stack"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          >
            <ControlPanel
              environmentalData={environmentalData}
              setEnvironmentalData={setEnvironmentalData}
              systemConfig={systemConfig}
              setSystemConfig={setSystemConfig}
              isSimulating={isSimulating}
              onStartSimulation={handleStartSimulation}
              onStopSimulation={handleStopSimulation}
            />
            {/* <FileUploader onFileUpload={handleFileUpload} /> */}
          </motion.section>

          <motion.section
            className="right-stack"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          >
            <Dashboard
              metrics={realTimeMetrics}
              isSimulating={isSimulating}
            />

            <Report
              metrics={realTimeMetrics}
              systemConfig={systemConfig}
              isSimulating={isSimulating}
            />

            <AnimatePresence>
              {simulationData && (
                <SimulationResults data={simulationData} />
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

export default App
