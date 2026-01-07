"use client";

import React, { PureComponent } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
// import { useEffect, useState } from 'react';

const data = [
  {
    subject: 'HP',
    A: 45,
    fullMark: 200,
  },
  {
    subject: 'ATK',
    A: 49,
    fullMark: 92,
  },
  {
    subject: 'DEF',
    A: 49,
    fullMark: 92,
  },
  {
    subject: 'SP. ATK',
    A: 65,
    fullMark: 121,
  },
  {
    subject: 'SP. DEF',
    A: 65,
    fullMark: 121,
  },
  {
    subject: 'SPEED',
    A: 45,
    fullMark: 85,
  },
];

export default class Example extends PureComponent {

  render() {
    return (        
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }
}
