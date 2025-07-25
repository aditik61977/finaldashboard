import React from 'react';
import Chart from 'react-apexcharts';

function App() {
  return (
    <div style={{padding: 40}}>
      <Chart
        options={{
          chart: { type: 'donut' },
          labels: ['Technology', 'Analytics'],
          legend: { position: 'right' }
        }}
        series={[5, 1]}
        type="donut"
        height={300}
      />
    </div>
  );
}

export default App;