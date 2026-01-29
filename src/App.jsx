import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import EnergyFlowVisualization from './components/EnergyFlowVisualization'
import Dashboard from './components/Dashboard'
import AdvancedCharts from './components/AdvancedCharts'
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
    mpptEfficiency: 0,
    dcDcEfficiency: 0,
    inverterEfficiency: 0,
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
    
    // Calculate component efficiencies
    const mpptEfficiency = calculateMPPTEfficiency()
    const dcDcEfficiency = calculateDCDCEfficiency()
    const inverterEfficiency = calculateInverterEfficiency(evCharging)
    
    // Apply efficiency losses to solar generation
    const solarWithLosses = solarGeneration * (mpptEfficiency / 100)
    
    // Calculate energy balance
    const { batteryFlow, gridFlow } = calculateEnergyBalance(solarWithLosses, evCharging)
    
    const efficiency = calculateEfficiency(solarGeneration, evCharging)

    setRealTimeMetrics({
      solarGeneration,
      batteryFlow,
      gridFlow,
      evCharging,
      efficiency,
      mpptEfficiency,
      dcDcEfficiency,
      inverterEfficiency,
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

  const calculateMPPTEfficiency = () => {
    const { solarIrradiance, temperature } = environmentalData
    // MPPT efficiency varies with irradiance and temperature
    // Higher irradiance = better efficiency, higher temp = lower efficiency
    const irradianceFactor = Math.min(solarIrradiance / 1000, 1)
    const tempFactor = 1 - (Math.max(temperature - 25, 0) * 0.001)
    const baseEfficiency = 98.5
    const efficiency = baseEfficiency * irradianceFactor * tempFactor
    return parseFloat(Math.max(Math.min(efficiency, 99.2), 92.0).toFixed(1))
  }

  const calculateDCDCEfficiency = () => {
    const { batterySOC } = systemConfig
    // DC/DC converter efficiency varies with battery state and load
    // Optimal efficiency around 50-80% SOC
    const socFactor = 1 - Math.abs(batterySOC - 65) * 0.0008
    const baseEfficiency = 97.2
    const efficiency = baseEfficiency * socFactor
    return parseFloat(Math.max(Math.min(efficiency, 98.5), 90.0).toFixed(1))
  }

  const calculateInverterEfficiency = (load) => {
    // Inverter efficiency varies with load
    // Peak efficiency at 30-70% of rated capacity
    const ratedCapacity = systemConfig.solarPanelCapacity
    const loadFactor = load / ratedCapacity
    let efficiency = 96.8
    
    if (loadFactor < 0.2) {
      // Low load penalty
      efficiency = 92.0 + (loadFactor / 0.2) * 4.8
    } else if (loadFactor > 0.8) {
      // High load penalty
      efficiency = 96.8 - ((loadFactor - 0.8) / 0.2) * 2.8
    }
    
    return parseFloat(Math.max(Math.min(efficiency, 97.5), 88.0).toFixed(1))
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
            <FileUploader onFileUpload={handleFileUpload} />
            
            <ControlPanel
              environmentalData={environmentalData}
              setEnvironmentalData={setEnvironmentalData}
              systemConfig={systemConfig}
              setSystemConfig={setSystemConfig}
              isSimulating={isSimulating}
              onStartSimulation={handleStartSimulation}
              onStopSimulation={handleStopSimulation}
              hasUploadedData={!!uploadedData}
            />
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

            <AdvancedCharts
              metrics={realTimeMetrics}
              isSimulating={isSimulating}
              systemConfig={systemConfig}
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
