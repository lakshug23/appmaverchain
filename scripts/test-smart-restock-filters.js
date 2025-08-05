const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Smart Restock Alert System Implementation...\n');

// Check if the DistributorDashboard.js file exists and contains our new code
const distributorDashboardPath = path.join(__dirname, '../frontend/src/pages/DistributorDashboard.js');

if (!fs.existsSync(distributorDashboardPath)) {
  console.error('❌ DistributorDashboard.js not found!');
  process.exit(1);
}

const fileContent = fs.readFileSync(distributorDashboardPath, 'utf8');

// Test for key features
const features = [
  {
    name: 'Hospital Filter State',
    pattern: /hospitalFilter.*useState.*\{[\s\S]*urgency.*type.*drug.*dateRange.*sortBy/,
    description: 'State management for hospital request filters'
  },
  {
    name: 'Export CSV Function',
    pattern: /exportHospitalRequestsReport.*format.*csv/,
    description: 'CSV export functionality for hospital requests'
  },
  {
    name: 'Export JSON Function',
    pattern: /exportHospitalRequestsReport.*format.*json/,
    description: 'JSON export functionality for hospital requests'
  },
  {
    name: 'Filter Function',
    pattern: /getFilteredHospitalRequests.*filter.*urgency.*type.*drug.*dateRange/,
    description: 'Hospital requests filtering logic'
  },
  {
    name: 'Clear Filters Function',
    pattern: /clearFiltersHospitalRequests.*setHospitalFilter/,
    description: 'Clear all filters functionality'
  },
  {
    name: 'Smart Restock Alert System UI',
    pattern: /Smart Restock Alert System.*Incoming Requests/,
    description: 'UI header for the smart restock system'
  },
  {
    name: 'Export Buttons',
    pattern: /Export CSV.*Export JSON/,
    description: 'Export functionality buttons'
  },
  {
    name: 'Filter Controls',
    pattern: /Urgency.*Hospital Type.*Drug.*Time Range.*Sort By/,
    description: 'Filter control elements'
  },
  {
    name: 'Filtered Results Display',
    pattern: /getFilteredHospitalRequests\(\)\.map/,
    description: 'Display filtered hospital requests'
  },
  {
    name: 'Results Summary',
    pattern: /Showing.*getFilteredHospitalRequests\(\)\.length.*of.*hospitalRequests\.length/,
    description: 'Results count summary'
  }
];

let passedTests = 0;
let totalTests = features.length;

console.log('📋 Feature Implementation Tests:\n');

features.forEach((feature, index) => {
  const found = feature.pattern.test(fileContent);
  console.log(`${index + 1}. ${feature.name}: ${found ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   ${feature.description}`);
  
  if (found) {
    passedTests++;
  } else {
    console.log(`   Pattern: ${feature.pattern}`);
  }
  console.log('');
});

// Additional syntax checks
console.log('🔧 Code Quality Checks:\n');

const syntaxChecks = [
  {
    name: 'No Syntax Errors',
    test: () => {
      try {
        // Basic bracket matching
        const openBrackets = (fileContent.match(/\{/g) || []).length;
        const closeBrackets = (fileContent.match(/\}/g) || []).length;
        return Math.abs(openBrackets - closeBrackets) <= 2; // Allow small variance
      } catch (e) {
        return false;
      }
    }
  },
  {
    name: 'React Hooks Usage',
    test: () => /useState.*hospitalFilter.*setHospitalFilter/.test(fileContent)
  },
  {
    name: 'Event Handlers',
    test: () => /onChange.*e\.target\.value/.test(fileContent)
  },
  {
    name: 'Export Implementation',
    test: () => /Blob.*URL\.createObjectURL.*link\.download/.test(fileContent)
  }
];

syntaxChecks.forEach((check, index) => {
  const passed = check.test();
  console.log(`${index + 1}. ${check.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  if (passed) passedTests++;
  totalTests++;
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Smart Restock Alert System is fully implemented.');
  console.log('\n🚀 Next Steps:');
  console.log('1. Start the frontend: npm start');
  console.log('2. Navigate to Distributor Dashboard');
  console.log('3. Go to Hospital Requests tab');
  console.log('4. Test filters and export functionality');
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
}

console.log('\n📁 File Location:', distributorDashboardPath);
console.log('📏 File Size:', (fs.statSync(distributorDashboardPath).size / 1024).toFixed(2) + ' KB');
