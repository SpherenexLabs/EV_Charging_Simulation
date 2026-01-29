import { motion } from 'framer-motion'
import { Activity, TrendingUp, Gauge, Battery } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard({ metrics, isSimulating }) {
  const [historicalData, setHistoricalData] = useState([])
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setTimestamp(prev => prev + 1)
        setHistoricalData(prev => {
          const newData = [...prev, {
            time: timestamp,
            solar: metrics.solarGeneration,
            battery: Math.abs(metrics.batteryFlow),
            grid: metrics.gridFlow,
            ev: metrics.evCharging,
          }]
          return newData.slice(-20) // Keep last 20 data points
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isSimulating, timestamp, metrics])

  const getStatusColor = (value, max) => {
    const percentage = (value / max) * 100
    if (percentage > 75) return '#22c55e'
    if (percentage > 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="dashboard">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h2 className="card-title">
          <Activity size={24} />
          Real-Time Metrics
        </h2>

        <div className="metrics-grid">
          <motion.div 
            className={`metric-card solar-metric ${isSimulating ? 'simulating' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="metric-icon">⚡</div>
            <div className="metric-label">Solar Generation</div>
            <div className="metric-value" style={{ color: '#f59e0b' }}>
              {metrics.solarGeneration.toFixed(2)} kW
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{ 
                  width: `${Math.min((metrics.solarGeneration / 100) * 100, 100)}%`,
                  background: '#f59e0b'
                }}
              />
            </div>
          </motion.div>

          <motion.div 
            className={`metric-card battery-metric ${isSimulating ? 'simulating' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="metric-icon">🔋</div>
            <div className="metric-label">Battery Flow</div>
            <div className="metric-value" style={{ color: '#3b82f6' }}>
              {Math.abs(metrics.batteryFlow).toFixed(2)} kW
            </div>
            <div className="metric-status">
              {metrics.batteryFlow > 0 ? 'Charging' : metrics.batteryFlow < 0 ? 'Discharging' : 'Idle'}
            </div>
          </motion.div>

          <motion.div 
            className={`metric-card grid-metric ${isSimulating ? 'simulating' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="metric-icon">🔌</div>
            <div className="metric-label">Grid Power</div>
            <div className="metric-value" style={{ color: '#94a3b8' }}>
              {metrics.gridFlow.toFixed(2)} kW
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{ 
                  width: `${Math.min((metrics.gridFlow / 100) * 100, 100)}%`,
                  background: '#94a3b8'
                }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="metric-card ev-metric"
            whileHover={{ scale: 1.02 }}
          >
            <div className="metric-icon">🚗</div>
            <div className="metric-label">EV Charging</div>
            <div className="metric-value" style={{ color: '#22c55e' }}>
              {metrics.evCharging.toFixed(2)} kW
            </div>
            <div className="metric-bar">
              <div 
                className="metric-bar-fill"
                style={{ 
                  width: `${Math.min((metrics.evCharging / 100) * 100, 100)}%`,
                  background: '#22c55e'
                }}
              />
            </div>
          </motion.div>
        </div>

        <div className="efficiency-gauge">
          <Gauge size={24} />
          <div className="efficiency-label">System Efficiency</div>
          <div className="efficiency-value">
            {metrics.efficiency.toFixed(1)}%
          </div>
          <div className="efficiency-bar">
            <div 
              className="efficiency-bar-fill"
              style={{ 
                width: `${metrics.efficiency}%`,
                background: getStatusColor(metrics.efficiency, 100)
              }}
            />
          </div>
        </div>
      </motion.div>

      {historicalData.length > 0 && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        >
          <h2 className="card-title">
            <TrendingUp size={24} />
            Energy Flow History
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(148, 163, 184, 0.7)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)' }}
              />
              <YAxis 
                stroke="rgba(148, 163, 184, 0.7)"
                tick={{ fill: 'rgba(148, 163, 184, 0.8)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="solar" 
                stroke="#fbbf24" 
                fillOpacity={1} 
                fill="url(#colorSolar)" 
                name="Solar (kW)"
              />
              <Area 
                type="monotone" 
                dataKey="ev" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorEV)" 
                name="EV Charging (kW)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard
