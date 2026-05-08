'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMyConnections,
  refreshConnection,
  deleteConnection,
  setConnectionVisibility,
} from '@/features/connections/services/connectionService';

export function useConnections(userId: string | null) {
  return useQuery({
    queryKey: ['connections', userId],
    queryFn: () => (userId ? listMyConnections(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useRefreshConnection(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refreshConnection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
    },
  });
}

type VisibilityArg = {
  id: string;
  hidden?: boolean;
  show_name?: boolean;
  show_picture?: boolean;
  paused?: boolean;
};

export function useSetVisibility(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: VisibilityArg) => setConnectionVisibility(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
    },
  });
}

export function useDeleteConnection(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections', userId] });
    },
  });
}
