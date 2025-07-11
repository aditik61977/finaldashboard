import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Typography, List, ListItem, ListItemText, Box, Grid, Card, CardContent, Paper, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import styles from './styles.module.css';

const PlacementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [placementTrends, setPlacementTrends] = useState([]);
  const [industryDistribution, setIndustryDistribution] = useState([]);
  const [packageDistribution, setPackageDistribution] = useState([]);
  const [branchComparison, setBranchComparison] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);

  const academicYearOptions = ['2022-2023', '2023-2024', '2024-2025'];
  const branchOptions = ['Computer Science', 'Electronics', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
  const [selectedYears, setSelectedYears] = useState(academicYearOptions);
  const [selectedBranches, setSelectedBranches] = useState(branchOptions);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [metricsRes, trendsRes, industryRes, packageRes, branchRes, companiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/student/reports-analytics/dashboard'),
          axios.get('http://localhost:5000/api/dashboard/placement-trends'),
          axios.get('http://localhost:5000/api/dashboard/industry-distribution'),
          axios.get('http://localhost:5000/api/dashboard/package-distribution'),
          axios.get('http://localhost:5000/api/dashboard/branch-comparison'),
          axios.get('http://localhost:5000/api/dashboard/companies/top-recruiting')
        ]);
        setMetrics(metricsRes.data);
        setPlacementTrends(trendsRes.data);
        setIndustryDistribution(industryRes.data);
        setPackageDistribution(packageRes.data);
        setBranchComparison(branchRes.data);
        setTopCompanies(companiesRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Key Metrics (Figma style)
  const placementPercent =
    metrics.application_statistics &&
    metrics.student_statistics &&
    metrics.student_statistics.total_students > 0
      ? (
          (metrics.application_statistics.unique_students_applied /
            metrics.student_statistics.total_students) *
            100
          ).toFixed(2)
        : null;

  const keyMetrics = [
    { label: 'Average Placement %', value: placementPercent !== null ? `${placementPercent}%` : '-' },
    { label: 'Average Package', value: metrics.job_statistics && metrics.job_statistics.average_salary
        ? `₹${(parseFloat(metrics.job_statistics.average_salary)/100000).toFixed(2)} LPA`
        : '-' },
    { label: 'Highest Package', value: metrics.job_statistics && metrics.job_statistics.max_salary
        ? `₹${(metrics.job_statistics.max_salary/100000).toFixed(2)} LPA`
        : '-' },
    { label: 'Total Offers', value: metrics.application_statistics && metrics.application_statistics.total_applications
        ? metrics.application_statistics.total_applications
        : '-' }
  ];

  // Placement Trends Chart (Line) - Placement Percentage vs Year
  const placementTrendsYears = placementTrends.map(item => item.year);
  const placementTrendsPercentages = placementTrends.map(item =>
    item.total_applications > 0
      ? ((item.selected_count / item.total_applications) * 100).toFixed(2)
      : 0
  );
  const placementTrendsOptions = {
    chart: { type: 'line' },
    xaxis: { categories: placementTrendsYears, title: { text: 'Year' } },
    yaxis: { title: { text: 'Placement Percentage (%)' }, min: 0, max: 100 },
    title: { text: 'Yearly Placement Percentage Trend' },
    dataLabels: { enabled: true },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#4575EF']
  };
  const placementTrendsSeries = [
    { name: 'Placement %', data: placementTrendsPercentages }
  ];

  // Branch Comparison Chart (Bar)
  const branchComparisonOptions = {
    chart: { type: 'bar' },
    xaxis: { categories: branchComparison.map(item => item.branch_name), title: { text: 'Branch' } },
    yaxis: { title: { text: 'Placement %' } },
    title: { text: 'Branch-wise Placement Comparison' },
    dataLabels: { enabled: true },
    colors: ['#776FD5']
  };
  const branchComparisonSeries = [
    { name: 'Placement %', data: branchComparison.map(item => parseFloat(item.placement_percentage)) }
  ];

  // Industry Distribution Chart (Donut)
  const filteredIndustry = Array.isArray(industryDistribution)
    ? industryDistribution.filter((item, idx, arr) => item.selected_count > 0 && arr.findIndex(i => i.industry_name === item.industry_name) === idx)
    : [];
  const industryOptions = {
    chart: { type: 'donut' },
    labels: filteredIndustry.map(i => i.industry_name),
    legend: { position: 'right' },
    colors: ['#4575EF', '#776FD5', '#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4']
  };
  const industrySeries = filteredIndustry.map(i => i.selected_count);

  // Package Distribution Chart (Bar)
  const packageOptions = {
    chart: { type: 'bar' },
    xaxis: { categories: packageDistribution.map(item => item.salary_range), title: { text: 'Salary Range' } },
    yaxis: { title: { text: 'Number of Jobs' } },
    title: { text: 'Package Distribution' },
    dataLabels: { enabled: true },
    colors: ['#29b6f6']
  };
  const packageSeries = [
    { name: 'Jobs', data: packageDistribution.map(item => item.job_count) }
  ];

  // Remove duplicates by company name
  const uniqueCompanies = [];
  const seen = new Set();
  for (const row of topCompanies) {
    const key = row.company_name || row.company;
    if (!seen.has(key)) {
      uniqueCompanies.push(row);
      seen.add(key);
    }
  }

  if (loading) return <Box className={styles.centered}><CircularProgress /></Box>;
  if (error) return <Box className={styles.centered}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box className={styles.root}>
      {/* Big Title Instead of Navbar */}
      <Box className={styles.mainTitle} component="div">
        Placement Dashboard
      </Box>
      <Box className={styles.dashboardRow}>
        <Box className={styles.sidebar}>
          <List className={styles.sidebarList}>
            {['Branch Statistics', 'Company History', 'Dashboard', 'Industry Analysis'].map((text) => (
              <ListItem key={text} className={styles.sidebarItem}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <div className={styles.sidebarDivider} />
          {/* Dashboard Filters Section */}
          <div className={styles.filterSection}>
            <Typography variant="subtitle1" className={styles.filterTitle}>Dashboard Filters</Typography>
            {/* Academic Years */}
            <Typography className={styles.filterLabel}>Select Academic Years</Typography>
            <Autocomplete
              multiple
              options={academicYearOptions}
              value={selectedYears}
              onChange={(_, value) => setSelectedYears(value)}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" />
              )}
              className={styles.filterChips}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <span key={option} className={styles.filterChip}>{option}</span>
                ))
              }
            />
            {/* Branches */}
            <Typography className={styles.filterLabel}>Select Branches</Typography>
            <Autocomplete
              multiple
              options={branchOptions}
              value={selectedBranches}
              onChange={(_, value) => setSelectedBranches(value)}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" />
              )}
              className={styles.filterChips}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <span key={option} className={styles.filterChip}>{option}</span>
                ))
              }
            />
          </div>
        </Box>
        <Box className={styles.dashboardContent}>
          <Paper className={styles.dashboardPaper}>
            <Typography variant="h4" gutterBottom className={styles.dashboardTitle}>Placement Dashboard</Typography>
            {/* Key Metrics */}
            <Grid container spacing={2} className={styles.metricsRow} justifyContent="space-between">
              {keyMetrics.map((m, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx} className={styles.metricCol}>
                  <Card className={styles.metricCard}>
                    <Typography variant="subtitle2" className={styles.metricLabel}>{m.label}</Typography>
                    <Typography variant="h5" className={styles.metricValue}>{m.value}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {/* Placement Trends and Branch Comparison */}
            <Grid container spacing={2} className={styles.chartsRow}>
              <Grid item xs={12} md={6} className={styles.chartCol}>
                <Card className={styles.chartCard}>
                  <CardContent>
                    <Typography variant="h6" className={styles.chartTitle}>Yearly Placement Percentage Trend</Typography>
                    <Chart options={placementTrendsOptions} series={placementTrendsSeries} type="line" height={300} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} className={styles.chartCol}>
                <Card className={styles.chartCard}>
                  <CardContent>
                    <Typography variant="h6" className={styles.chartTitle}>Branch-wise Placement Comparison</Typography>
                    <Chart options={branchComparisonOptions} series={branchComparisonSeries} type="bar" height={300} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* Placement Distribution Section */}
            <Typography variant="h5" className={styles.sectionTitle}>Placement Distribution</Typography>
            <Grid container spacing={2} className={styles.chartsRow}>
              <Grid item xs={12} md={6} className={styles.chartCol}>
                <Card className={styles.chartCard}>
                  <CardContent>
                    <Typography variant="h6" className={styles.chartTitle}>Industry-wise Placement Distribution</Typography>
                    <Chart options={industryOptions} series={industrySeries} type="donut" height={300} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} className={styles.chartCol}>
                <Card className={styles.chartCard}>
                  <CardContent>
                    <Typography variant="h6" className={styles.chartTitle}>Package Distribution</Typography>
                    <Chart options={packageOptions} series={packageSeries} type="bar" height={300} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {/* Top Recruiting Companies Table */}
            <Typography variant="h5" className={styles.sectionTitle}>Top Recruiting Companies</Typography>
            <Paper className={styles.companyTablePaper}>
              <Table className={styles.companyTable}>
                <TableHead>
                  <TableRow className={styles.companyTableHeadRow}>
                    <TableCell className={styles.companyTableHeadCell}>Company</TableCell>
                    <TableCell className={styles.companyTableHeadCell}>Total Offers</TableCell>
                    <TableCell className={styles.companyTableHeadCell}>Average Package (LPA)</TableCell>
                    <TableCell className={styles.companyTableHeadCell}>Highest Package (LPA)</TableCell>
                    <TableCell className={styles.companyTableHeadCell}>Industry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uniqueCompanies.slice(0, 10).map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={styles.companyTableRow}
                    >
                      <TableCell className={styles.companyTableCell}>{row.company_name || row.company || '-'}</TableCell>
                      <TableCell className={styles.companyTableCell}>{row.selected_count || row.offers || row.applications_count || 0}</TableCell>
                      <TableCell className={styles.companyTableCell}>
                        {row.avg_salary
                          ? (row.avg_salary / 100000).toFixed(2)
                          : row.average_salary
                            ? (parseFloat(row.average_salary) / 100000).toFixed(2)
                            : row.avg
                              ? row.avg
                              : 0}
                      </TableCell>
                      <TableCell className={styles.companyTableCell}>
                        {row.max_salary
                          ? (row.max_salary / 100000).toFixed(2)
                          : row.high
                            ? row.high
                            : 0}
                      </TableCell>
                      <TableCell className={styles.companyTableCell}>{row.industry_name || row.industry || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

createRoot(document.getElementById('root')).render(<PlacementDashboard />);
