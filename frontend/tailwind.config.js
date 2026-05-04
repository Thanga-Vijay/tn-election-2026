module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        tamil: ["'Noto Sans Tamil'", 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif']
      },
      colors: {
        bg: '#080810',
        panel: '#0f0f1a',
        border: '#1a1a2e',
        gold: '#f5c842',
        accent: '#e040fb'
      }
    }
  },
  plugins: []
};
