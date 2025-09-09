const fs = require('fs');

// Read the current file
let content = fs.readFileSync('src/features/home/components/InvestorLoginForm.tsx', 'utf8');

// Replace the problematic section
content = content.replace(
  `      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Main Dark Card */}
        <div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-5xl font-bold mb-2"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
              }}
            >
              WAGMI
            </h1>
            <p 
              className="text-lg"
              style={{ color: '#A0A0A0' }}
            >
              We&apos;re All Gonna Make It
            </p>
          </div>`,
  `      {/* WAGMI Branding */}
      <div className="text-center mb-8">
        <h1 
          className="text-5xl font-bold mb-2"
          style={{ 
            color: '#00FF95',
            textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
          }}
        >
          WAGMI
        </h1>
        <p 
          className="text-lg"
          style={{ color: '#A0A0A0' }}
        >
          We&apos;re All Gonna Make It
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Main Dark Card */}
        <div>`
);

// Write the updated content
fs.writeFileSync('src/features/home/components/InvestorLoginForm.tsx', content);
console.log('Step 2 completed: WAGMI branding moved outside container');
