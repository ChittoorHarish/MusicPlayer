import useEventStore from '../stores/eventStore';
import useQueueStore from '../stores/queueStore';
import { useRoleStore } from '../stores/roleStore';
import usePlayerStore from '../stores/playerStore';
import useChatStore from '../stores/chatStore';

export const initializeStores = () => {
  // Reset all stores to initial state
  useEventStore.getState().setEventData(null);
  useQueueStore.getState().clearQueue();
  useRoleStore.getState().resetRole();
  usePlayerStore.getState().resetPlayer();
  useChatStore.getState().clearChat();
};

export const cleanupStores = () => {
  // Cleanup logic when event ends
  useEventStore.getState().setEventData(null);
  useQueueStore.getState().clearQueue();
  usePlayerStore.getState().resetPlayer();
  useChatStore.getState().clearChat();
};