import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

const ELEMENTS_QUERY_KEY = ["elements"];

export interface ApiElement {
  id: string;
  userId: string;
  handle: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useElements() {
  const queryClient = useQueryClient();

  const { data: elements = [], isLoading } = useQuery(
    orpc.element.list.queryOptions()
  );

  const createMutation = useMutation(
    orpc.element.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ELEMENTS_QUERY_KEY });
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.element.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ELEMENTS_QUERY_KEY });
      },
    })
  );

  return {
    elements,
    isLoading,
    createElement: createMutation.mutateAsync,
    deleteElement: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
