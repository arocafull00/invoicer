import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../services';
import type { AppointmentInput } from '@/shared/types';

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: AppointmentInput) => createAppointment(appointment),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointment }: { id: string; appointment: AppointmentInput }) =>
      updateAppointment(id, appointment),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
