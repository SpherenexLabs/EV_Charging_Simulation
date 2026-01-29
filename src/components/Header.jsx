import { motion } from 'framer-motion'
import { Sun, Zap, Battery } from 'lucide-react'
import './Header.css'

function Header() {
  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="header-content">
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sun className="icon sun-icon" size={32} />
          <h1>Solar EV Charging Station</h1>
        </motion.div>
        
        <div className="header-icons">
          <motion.div
            className="icon-wrapper"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sun className="icon" size={24} />
          </motion.div>
          <motion.div
            className="icon-wrapper"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="icon" size={24} />
          </motion.div>
          <motion.div
            className="icon-wrapper"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Battery className="icon" size={24} />
          </motion.div>
        </div>
      </div>
      
      <p className="subtitle">Intelligent Energy Management System with ML/DL Optimization</p>
    </motion.header>
  )
}

export default Header
