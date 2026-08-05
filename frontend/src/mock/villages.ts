import type { Village } from '../types';

export const villages: Village[] = [
  {
    id: 'v-01',
    name: '青溪村',
    township: '龙泉镇',
    population: 2140,
    households: 612,
    isPilot: true,
    location: { lat: 28.422, lng: 118.862 },
    healthScore: 92,
    keyContact: {
      name: '张海涛',
      role: '村级水管员',
      phone: '138-5782-3301',
    },
  },
  {
    id: 'v-02',
    name: '石桥村',
    township: '龙泉镇',
    population: 1580,
    households: 438,
    isPilot: true,
    location: { lat: 28.451, lng: 118.902 },
    healthScore: 85,
    keyContact: {
      name: '陈美玲',
      role: '村级水管员',
      phone: '139-6621-8847',
    },
  },
  {
    id: 'v-03',
    name: '梅岭村',
    township: '云岫乡',
    population: 960,
    households: 271,
    isPilot: true,
    location: { lat: 28.505, lng: 118.826 },
    healthScore: 68,
    keyContact: {
      name: '王建国',
      role: '村级水管员',
      phone: '137-5903-1156',
    },
  },
];
