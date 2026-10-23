import { apiClient } from '../client';
import type { Appointment, AppointmentInput } from '@/shared/types';

export const getAppointments = async (): Promise<Appointment[]> => {
  return await apiClient.getAppointments();
};

export const createAppointment = async (
  appointment: AppointmentInput
): Promise<Appointment> => {
  return await apiClient.createAppointment(appointment);
};

export const updateAppointment = async (
  id: string,
  appointment: AppointmentInput
): Promise<Appointment> => {
  return await apiClient.updateAppointment(id, appointment);
};

export const deleteAppointment = async (id: string): Promise<void> => {
  return await apiClient.deleteAppointment(id);
};
