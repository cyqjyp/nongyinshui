import type {
  ElderlyPerson,
  ElderlyCareRecord,
  ElderlyWaterAlert,
  ElderlyCareOverview,
} from '../types';
import {
  getElderlyCareOverview as mockGetOverview,
  getElderlyPersonsByVillage as mockGetByVillage,
  getElderlyPersonById as mockGetById,
  getCareRecordsByElderly as mockGetRecords,
  getWaterAlertsByElderly as mockGetAlerts,
  getUnhandledAlerts as mockGetUnhandledAlerts,
} from '../mock/elderlyCare';

export function getElderlyCareOverview(): ElderlyCareOverview {
  return mockGetOverview();
}

export function getElderlyPersons(villageId?: string): ElderlyPerson[] {
  return mockGetByVillage(villageId);
}

export function getElderlyPersonById(id: string): ElderlyPerson | undefined {
  return mockGetById(id);
}

export function getCareRecords(elderlyId: string): ElderlyCareRecord[] {
  return mockGetRecords(elderlyId);
}

export function getWaterAlerts(elderlyId: string): ElderlyWaterAlert[] {
  return mockGetAlerts(elderlyId);
}

export function getUnhandledWaterAlerts(): ElderlyWaterAlert[] {
  return mockGetUnhandledAlerts();
}
