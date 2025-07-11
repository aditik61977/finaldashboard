import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import styles from './Footer.module.css';

const Footer = () => (
  <Box className={styles.footer}>
    <Typography variant="body1" className={styles.text}>
      All rights reserved©<br />
      supportmail@ietdavv.edu.in<br />
      Managed by Placement CELL IET
    </Typography>
    <Box className={styles.socials}>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramIcon /></a>
      <a href="https://x.com" target="_blank" rel="noopener noreferrer"><XIcon /></a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><LinkedInIcon /></a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><YouTubeIcon /></a>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookIcon /></a>
    </Box>
  </Box>
);

export default Footer; 