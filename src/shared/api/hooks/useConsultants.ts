import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultants, createConsultant } from '../services';

export const useConsultants = () => {
  return useQuery({
    queryKey: ['consultants'],
    queryFn: getConsultants,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateConsultant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createConsultant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
    },
  });
};