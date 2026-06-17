import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api.js';

export function useChats(documentId) {
  return useQuery({
    queryKey: ['chats', documentId],
    queryFn: () => aiApi.listChats(documentId ? { documentId } : undefined),
  });
}

export function useAskQuestion(documentId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (question) => aiApi.chat({ documentId, question }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats', documentId] }),
  });
}

export function useDeleteChat(documentId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => aiApi.deleteChat(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats', documentId] }),
  });
}

export function useSummary(documentId) {
  return useMutation({
    mutationFn: () => aiApi.summary(documentId),
  });
}
