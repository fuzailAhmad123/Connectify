/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors:{
          black:{
            5:"#000000",
            25:"#121212",
            50:"#232329"
          },
          grey:{
            5:"#f5f5f5",
            25:"#e9ecef",
            50:"#ced4da",
            75:"#adb5bd"
       },
       red:"#FF0000"
    },
    extend: {},
  },
  plugins: [],
}
