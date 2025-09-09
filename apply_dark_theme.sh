#!/bin/bash

# Apply dark theme to investor dashboard
sed -i '' 's/className="min-h-screen bg-gray-50"/style={{ backgroundColor: '\''#111'\'' }}/g' src/app/investor/page.tsx
sed -i '' 's/className="bg-white shadow-sm border-b"/style={{ backgroundColor: '\''#16181D'\'', borderColor: '\''#333'\'' }}/g' src/app/investor/page.tsx
sed -i '' 's/className="text-xl font-bold text-gray-900"/style={{ color: '\''#FFFFFF'\'' }}/g' src/app/investor/page.tsx
sed -i '' 's/className="text-sm text-gray-500"/style={{ color: '\''#A0A0A0'\'' }}/g' src/app/investor/page.tsx

echo "Dark theme applied successfully!"
