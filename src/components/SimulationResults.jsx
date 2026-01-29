import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Award, Zap } from 'lucide-react'
import './SimulationResults.css'

function SimulationResults({ data }) {
  if (!data) return null

  const COLORS = ['#4ade80', '#3b82f6', '#f59e0b', '#8b5cf6']

  const energyDistribution = [
    { name: 'Solar', value: data.totalSolarGeneration },
    { name: 'Battery', value: data.totalBatteryDischarge },
    { name: 'Grid', value: data.totalGridImport },
  ]

  const performanceMetrics = [
    { metric: 'Avg Efficiency', value: data.averageEfficiency, unit: '%' },
    { metric: 'Peak Solar', value: data.peakSolarGeneration, unit: 'kW' },
    { metric: 'Total Energy', value: data.totalEnergyConsumed, unit: 'kWh' },
    { metric: 'Cost Savings', value: data.estimatedCostSavings, unit: '$' },
  ]

  return (
    <motion.div 
      className="card simulation-results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="card-title">
        <Award size={24} />
        Simulation Results
      </h2>

      <div className="results-summary">
        <div className="summary-card">
          <Zap className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">Total Duration</div>
            <div className="summary-value">{data.duration} hours</div>
          </div>
        </div>
        
        <div className="summary-card">
          <TrendingUp className="summary-icon" />
          <div className="summary-content">
            <div className="summary-label">Average Efficiency</div>
            <div className="summary-value">{data.averageEfficiency.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="metrics-list">
        <h3 className="section-title">Performance Metrics</h3>
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={index}
            className="metric-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="metric-name">{metric.metric}</span>
            <span className="metric-result">
              {metric.value.toFixed(2)} {metric.unit}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3 className="section-title">Energy Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={energyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {energyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3 className="section-title">Hourly Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="hour" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="solar" fill="#fbbf24" name="Solar (kWh)" />
              <Bar dataKey="ev" fill="#8b5cf6" name="EV Charging (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recommendations">
        <h3 className="section-title">ML/DL Recommendations</h3>
        <ul className="recommendations-list">
          {data.mlRecommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {rec}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default SimulationResults
