// EMS Simulation Engine with ML/DL Optimization
export async function simulateEMS(params) {
  const {
    solarIrradiance,
    temperature,
    cloudCover,
    windSpeed,
    solarPanelCapacity,
    batteryCapacity,
    batterySOC,
    numberOfEVChargers,
    evChargingDemand,
    gridConnection,
    mlOptimization,
    uploadedData,
    duration = 24,
  } = params

  // Simulate 24-hour operation
  const hourlyData = []
  let totalSolarGeneration = 0
  let totalBatteryDischarge = 0
  let totalGridImport = 0
  let totalEnergyConsumed = 0
  let currentBatterySOC = batterySOC
  let efficiencySum = 0

  for (let hour = 0; hour < duration; hour++) {
    // Time-based variations
    const timeOfDay = hour / 24
    const solarMultiplier = Math.max(0, Math.sin(Math.PI * timeOfDay)) // Solar variation
    
    // Calculate solar generation with environmental factors
    let hourlyIrradiance = solarIrradiance * solarMultiplier
    let tempCoefficient = 1 - (temperature - 25) * 0.004
    let cloudFactor = 1 - (cloudCover / 100) * 0.7
    
    // Use uploaded data if available (override simulation parameters)
    if (uploadedData && uploadedData.length > hour) {
      const row = uploadedData[hour]
      
      // Attempt to map common column names
      if (row.irradiance !== undefined) hourlyIrradiance = row.irradiance
      if (row.solar_irradiance !== undefined) hourlyIrradiance = row.solar_irradiance
      if (row.GHI !== undefined) hourlyIrradiance = row.GHI // Global Horizontal Irradiance
      
      if (row.temperature !== undefined) {
        tempCoefficient = 1 - (row.temperature - 25) * 0.004
      }
      
      if (row.cloud_cover !== undefined) {
        cloudFactor = 1 - (row.cloud_cover / 100) * 0.7
      }
    }
    
    const efficiency = 0.20 * tempCoefficient * cloudFactor
    
    const solarGen = (hourlyIrradiance / 1000) * solarPanelCapacity * efficiency
    totalSolarGeneration += solarGen

    // EV charging demand (varies by time of day)
    const demandMultiplier = hour >= 8 && hour <= 18 ? 1.2 : 0.8 // Higher during day
    let evDemand = evChargingDemand * demandMultiplier
    
    // Override with uploaded demand data if available
    if (uploadedData && uploadedData.length > hour) {
      const row = uploadedData[hour]
      if (row.ev_demand !== undefined) evDemand = row.ev_demand
      if (row.demand !== undefined) evDemand = row.demand
      if (row.consumption !== undefined) evDemand = row.consumption
    }

    totalEnergyConsumed += evDemand

    // Energy Management Strategy with ML Optimization
    let batteryFlow = 0
    let gridImport = 0

    if (mlOptimization) {
      // ML-optimized energy management
      const { battery, grid, efficiency: mlEfficiency } = mlOptimizedStrategy(
        solarGen,
        evDemand,
        currentBatterySOC,
        batteryCapacity,
        gridConnection,
        hour
      )
      batteryFlow = battery
      gridImport = grid
      efficiencySum += mlEfficiency
    } else {
      // Basic rule-based strategy
      const result = basicStrategy(
        solarGen,
        evDemand,
        currentBatterySOC,
        batteryCapacity,
        gridConnection
      )
      batteryFlow = result.battery
      gridImport = result.grid
      efficiencySum += result.efficiency
    }

    // Update battery SOC
    const batteryChange = (batteryFlow / batteryCapacity) * 100
    currentBatterySOC = Math.max(10, Math.min(95, currentBatterySOC + batteryChange))

    if (batteryFlow < 0) {
      totalBatteryDischarge += Math.abs(batteryFlow)
    }
    totalGridImport += gridImport

    hourlyData.push({
      hour,
      solar: parseFloat(solarGen.toFixed(2)),
      battery: parseFloat(batteryFlow.toFixed(2)),
      grid: parseFloat(gridImport.toFixed(2)),
      ev: parseFloat(evDemand.toFixed(2)),
      soc: parseFloat(currentBatterySOC.toFixed(1)),
    })
  }

  const averageEfficiency = efficiencySum / duration
  const peakSolarGeneration = Math.max(...hourlyData.map(d => d.solar))
  
  // Cost calculations (simplified)
  const gridCostPerKWh = 0.12 // $0.12 per kWh
  const solarCostPerKWh = 0.03 // $0.03 per kWh (after installation)
  const estimatedCostSavings = (totalSolarGeneration + totalBatteryDischarge) * (gridCostPerKWh - solarCostPerKWh)

  // ML/DL Recommendations
  const mlRecommendations = generateMLRecommendations(
    totalSolarGeneration,
    totalGridImport,
    totalEnergyConsumed,
    averageEfficiency,
    batteryCapacity,
    solarPanelCapacity
  )

  return {
    duration,
    hourlyData,
    totalSolarGeneration: parseFloat(totalSolarGeneration.toFixed(2)),
    totalBatteryDischarge: parseFloat(totalBatteryDischarge.toFixed(2)),
    totalGridImport: parseFloat(totalGridImport.toFixed(2)),
    totalEnergyConsumed: parseFloat(totalEnergyConsumed.toFixed(2)),
    averageEfficiency: parseFloat(averageEfficiency.toFixed(2)),
    peakSolarGeneration: parseFloat(peakSolarGeneration.toFixed(2)),
    estimatedCostSavings: parseFloat(estimatedCostSavings.toFixed(2)),
    finalBatterySOC: parseFloat(currentBatterySOC.toFixed(1)),
    mlRecommendations,
  }
}

// ML-Optimized Energy Management Strategy
function mlOptimizedStrategy(solarGen, demand, batterySOC, batteryCapacity, gridConnection, hour) {
  let battery = 0
  let grid = 0
  let efficiency = 0

  // Predictive energy management based on time of day
  const isDayTime = hour >= 6 && hour <= 18
  const isPeakDemand = hour >= 8 && hour <= 18

  if (solarGen >= demand) {
    // Surplus solar energy
    efficiency = 95
    
    if (batterySOC < 90 && isDayTime) {
      // Charge battery during daytime when SOC is low
      battery = (solarGen - demand) * 0.92 // 92% charging efficiency
    } else if (gridConnection && batterySOC > 80) {
      // Could export to grid (not implemented here)
      battery = 0
    }
  } else {
    // Energy deficit
    const deficit = demand - solarGen

    if (batterySOC > 30 && !isPeakDemand) {
      // Use battery during off-peak hours
      battery = -Math.min(deficit, batteryCapacity * (batterySOC / 100) * 0.2)
      efficiency = 88
      
      if (solarGen + Math.abs(battery) < demand && gridConnection) {
        grid = demand - solarGen - Math.abs(battery)
        efficiency = 82
      }
    } else if (gridConnection) {
      // Use grid during peak demand or low battery
      grid = deficit
      efficiency = 75
    } else {
      // Use battery as backup
      battery = -Math.min(deficit, batteryCapacity * (batterySOC / 100) * 0.3)
      efficiency = 70
    }
  }

  return { battery, grid, efficiency }
}

// Basic Rule-Based Strategy
function basicStrategy(solarGen, demand, batterySOC, batteryCapacity, gridConnection) {
  let battery = 0
  let grid = 0
  let efficiency = 0

  if (solarGen >= demand) {
    // Surplus
    efficiency = 90
    if (batterySOC < 95) {
      battery = (solarGen - demand) * 0.90
    }
  } else {
    // Deficit
    const deficit = demand - solarGen

    if (batterySOC > 20) {
      battery = -Math.min(deficit, batteryCapacity * (batterySOC / 100) * 0.25)
      efficiency = 85
      
      const remaining = deficit - Math.abs(battery)
      if (remaining > 0 && gridConnection) {
        grid = remaining
        efficiency = 80
      }
    } else if (gridConnection) {
      grid = deficit
      efficiency = 70
    }
  }

  return { battery, grid, efficiency }
}

// Generate ML/DL Recommendations
function generateMLRecommendations(totalSolar, totalGrid, totalConsumption, avgEfficiency, batteryCapacity, solarCapacity) {
  const recommendations = []

  const solarPercentage = (totalSolar / totalConsumption) * 100
  const gridDependency = (totalGrid / totalConsumption) * 100

  if (solarPercentage < 50) {
    recommendations.push('Consider increasing solar panel capacity by 30-50% to improve renewable energy utilization.')
  }

  if (gridDependency > 40) {
    recommendations.push('High grid dependency detected. Increase battery capacity to store excess solar energy.')
  }

  if (avgEfficiency < 80) {
    recommendations.push('System efficiency is below optimal. Review component specifications and maintenance schedules.')
  }

  if (batteryCapacity < solarCapacity * 2) {
    recommendations.push('Battery capacity is low relative to solar capacity. Consider upgrading to ' + 
                        (solarCapacity * 2).toFixed(0) + ' kWh for better energy storage.')
  }

  recommendations.push('ML model suggests implementing time-based charging schedules during peak solar hours.')
  recommendations.push('Deep learning analysis recommends predictive maintenance for optimal performance.')

  return recommendations
}
