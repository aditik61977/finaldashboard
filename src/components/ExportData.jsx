
import React, { useState } from 'react';
import { RadioGroup, FormControlLabel, Radio, Button, FormLabel } from '@mui/material';

const ExportData = ({ onExport }) => {
  const [format, setFormat] = useState('csv');

  const handleExport = () => {
    onExport(format);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <FormLabel component="legend">Select Export Format</FormLabel>
      <RadioGroup
        row
        aria-label="export-format"
        name="export-format"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <FormControlLabel value="csv" control={<Radio />} label="CSV" />
        <FormControlLabel value="excel" control={<Radio />} label="Excel" />
      </RadioGroup>
      <Button variant="outlined" onClick={handleExport}>Export Dashboard Data</Button>
    </div>
  );
};

export default ExportData;
