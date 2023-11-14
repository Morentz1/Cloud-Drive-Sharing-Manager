
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        notifToRight : 'notifToRightKF 0.7s',
        notifToLeft : "notifToLeftKF 0.7s"
      },

      keyframes: {
        notifToRightKF : {
          from : { transform: 'translateX(100%)' },
          to : { translate : 'translateX(0)'}
        },
        notifToLeftKF : {
          from : { transform: 'translateX(-100%)' },
          to : { translate : 'translateX(0)'}
        }
      }

    },
  },
  plugins: [],
}
