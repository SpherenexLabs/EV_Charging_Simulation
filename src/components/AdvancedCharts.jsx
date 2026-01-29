import { motion } from 'framer-motion'
import { TrendingUp, Activity, Zap, Battery } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts'
import { useState, useEffect } from 'react'
import './AdvancedCharts.css'

function AdvancedCharts({ metrics, isSimulating, systemConfig }) {
  const [historicalData, setHistoricalData] = useState([])
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setTimestamp(prev => prev + 1)
        setHistoricalData(prev => {
          const newData = [...prev, {
            time: `${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}`,
            timeNum: timestamp,
            solar: parseFloat(metrics.solarGeneration.toFixed(2)),
            battery: parseFloat(Math.abs(metrics.batteryFlow).toFixed(2)),
            grid: parseFloat(metrics.gridFlow.toFixed(2)),
            ev: parseFloat(metrics.evCharging.toFixed(2)),
            soc: systemConfig.batterySOC,
            batteryCharge: metrics.batteryFlow > 0 ? parseFloat(metrics.batteryFlow.toFixed(2)) : 0,
            batteryDischarge: metrics.batteryFlow < 0 ? parseFloat(Math.abs(metrics.batteryFlow).toFixed(2)) : 0,
          }]
          return newData.slice(-30) // Keep last 30 data points
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isSimulating, timestamp, metrics, systemConfig.batterySOC])

  if (!isSimulating || historicalData.length < 2) {
    return null
  }

  return (
    <div className="advanced-charts">
      {/* Time vs Generation Chart */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="chart-title">
          <TrendingUp size={20} />
          Time vs Energy Generation & Consumption
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: 'rgba(148, 163, 184, 0.9)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="solar" 
              stroke="#f59e0b" 
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Solar Generation (kW)"
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="ev" 
              stroke="#22c55e" 
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="EV Load (kW)"
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="grid" 
              stroke="#94a3b8" 
              strokeWidth={2}
              dot={{ r: 2.5 }}
              name="Grid Supply (kW)"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* SoC vs Time Chart */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <h3 className="chart-title">
          <Battery size={20} />
          Battery State of Charge vs Time
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id="colorSOC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'SoC (%)', angle: -90, position: 'insideLeft', fill: 'rgba(148, 163, 184, 0.9)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="soc" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorSOC)" 
              name="Battery SoC (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Load vs Grid Usage Chart */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <h3 className="chart-title">
          <Zap size={20} />
          EV Load vs Grid Usage
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: 'rgba(148, 163, 184, 0.9)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="ev" 
              fill="#22c55e" 
              name="EV Load (kW)"
              radius={[4, 4, 0, 0]}
            />
            <Line 
              type="monotone" 
              dataKey="grid" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#ef4444' }}
              name="Grid Usage (kW)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Battery Charge/Discharge Profile */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
      >
        <h3 className="chart-title">
          <Battery size={20} />
          Battery Charge/Discharge Profile
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(148, 163, 184, 0.7)"
              tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: 'rgba(148, 163, 184, 0.9)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="batteryCharge" 
              fill="#22c55e" 
              name="Charging (kW)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="batteryDischarge" 
              fill="#ef4444" 
              name="Discharging (kW)"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default AdvancedCharts
