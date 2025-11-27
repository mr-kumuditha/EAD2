module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#3B82F6',    // Your blue color
                    secondary: '#F3F4F6',  // Light gray background
                    text: '#1F2937',       // Dark gray text
                    hover: '#2563EB',      // Darker blue for hover
                }
            }
        },
    },
    plugins: [],
}