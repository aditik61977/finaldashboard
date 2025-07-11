import React from 'react';
import styles from './Sidebar.module.css';
import { Chip, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';

const Sidebar = ({
  academicYears = [],
  selectedYears = [],
  onYearChange,
  branches = [],
  selectedBranches = [],
  onBranchChange
}) => {
  console.log('Sidebar - academicYears:', academicYears);
  console.log('Sidebar - selectedYears:', selectedYears);
  console.log('Sidebar - branches:', branches);
  console.log('Sidebar - selectedBranches:', selectedBranches);

  const safeSelectedYears = Array.isArray(selectedYears) ? selectedYears : [];
  const safeSelectedBranches = Array.isArray(selectedBranches) ? selectedBranches : [];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.active}>app</li>
          <li>branch statistics</li>
          <li>company history</li>
          <li>dashboard</li>
          <li>eligibility explorer</li>
          <li>industry analysis</li>
        </ul>
      </nav>

      <div className={styles.filters}>
        <h3>Dashboard Filters</h3>

        <FormControl fullWidth margin="normal">
          <InputLabel id="academic-year-label">Select Academic Years</InputLabel>
          {Array.isArray(academicYears) && academicYears.length > 0 ? (
            <Select
              labelId="academic-year-label"
              multiple
              value={safeSelectedYears}
              onChange={onYearChange}
              renderValue={(selected) => (
                <div className={styles.chipContainer}>
                  {selected.map(value => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
            >
              {academicYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          ) : (
            <div className={styles.noData}>No academic years available</div>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="branch-label">Select Branches</InputLabel>
          {Array.isArray(branches) && branches.length > 0 ? (
            <Select
              labelId="branch-label"
              multiple
              value={safeSelectedBranches}
              onChange={onBranchChange}
              renderValue={(selected) => (
                <div className={styles.chipContainer}>
                  {selected.map(value => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
            >
              {branches.map(branch => (
                <MenuItem key={branch} value={branch}>{branch}</MenuItem>
              ))}
            </Select>
          ) : (
            <div className={styles.noBranches}>No branches available</div>
          )}
        </FormControl>
      </div>
    </aside>
  );
};

export default Sidebar;