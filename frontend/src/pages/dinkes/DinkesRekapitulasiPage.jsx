import React from 'react';
import PuskesmasRekapitulasiPage from '../puskesmas/PuskesmasRekapitulasiPage';

export default function DinkesRekapitulasiPage(props) {
  return (
    <PuskesmasRekapitulasiPage 
      {...props}
      userRole="dinkes"
    />
  );
}
