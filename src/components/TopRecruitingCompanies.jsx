
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import styles from './TopRecruitingCompanies.module.css';

const TopRecruitingCompanies = ({ companies = [] }) => {
  console.log('TopRecruitingCompanies - companies:', companies);

  const safeCompanies = Array.isArray(companies) ? companies : [];

  if (safeCompanies.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <Typography variant="h6" className={styles.sectionTitle}>Top Recruiting Companies</Typography>
        <Typography variant="body1">No company data available.</Typography>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <Typography variant="h6" className={styles.sectionTitle}>Top Recruiting Companies</Typography>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="top recruiting companies">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell align="right">Total Offers</TableCell>
              <TableCell align="right">Average Package (LPA)</TableCell>
              <TableCell align="right">Highest Package (LPA)</TableCell>
              <TableCell>Industry</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeCompanies.map((row, index) => (
              <TableRow key={row.company_name || index}>
                <TableCell component="th" scope="row">{row.company_name || 'Unknown'}</TableCell>
                <TableCell align="right">{row.total_jobs || 0}</TableCell>
                <TableCell align="right">{row.avg_salary ? Math.round(row.avg_salary / 100000) : 0}</TableCell>
                <TableCell align="right">{row.max_salary ? Math.round(row.max_salary / 100000) : 0}</TableCell>
                <TableCell>{row.industry_name || 'Unknown'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TopRecruitingCompanies;
