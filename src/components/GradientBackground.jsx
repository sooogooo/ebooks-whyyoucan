export default function GradientBackground() {
  return (
    <div style={styles.container}>
      <div style={styles.gradientOrb1} className="gradient-orb" />
      <div style={styles.gradientOrb2} className="gradient-orb" />
      <div style={styles.gradientOrb3} className="gradient-orb" />
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
    pointerEvents: 'none',
  },
  gradientOrb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'float 20s ease-in-out infinite',
  },
  gradientOrb2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'float 25s ease-in-out infinite reverse',
  },
  gradientOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    animation: 'float 30s ease-in-out infinite',
  },
}
