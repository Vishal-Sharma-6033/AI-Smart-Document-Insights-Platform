import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api.js';

const KEY = ['documents'];

export function useDocuments(params) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => documentsApi.list(params),

    refetchInterval: (query) => {
      const items = query.state.data?.items || [];
      return items.some((d) => d.status === 'processing' || d.status === 'uploaded')
        ? 4000
        : false;
    },
  });
}

export function useDocument(id) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.get(id),
    enabled: !!id,
    refetchInterval: (query) =>
      ['processing', 'uploaded'].includes(query.state.data?.status) ? 4000 : false,
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
