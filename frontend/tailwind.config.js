module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
        tamil: ["'Noto Sans Tamil'", 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif']
      },
      colors: {
        beach: '#FFF8F0',
        sand: '#F5E9DA',
        ocean: '#E8F4F8',
        accent: '#F7C873',
        coral: '#FF8C61',
        seafoam: '#A8DADC',
        // Keep old colors for gradual migration
        bg: '#080810',
        panel: '#0f0f1a',
        border: '#1a1a2e',
        gold: '#f5c842'
      }
    }
  },
  plugins: []
};
