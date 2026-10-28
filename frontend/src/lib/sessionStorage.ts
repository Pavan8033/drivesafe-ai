import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { SessionSummary } from '../types/session';

const LOCAL_STORAGE_PREFIX = 'drivesafe_sessions_';

/**
 * Persist completed session summary to Firestore or local storage.
 */
export async function saveSessionSummary(
  userId: string,
  session: SessionSummary
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isFirebaseConfigured && db) {
      // 1. Save session header document
      const sessionRef = doc(db, 'users', userId, 'sessions', session.session_id);
      await setDoc(sessionRef, {
        sessionId: session.session_id,
        startedAt: session.start_timestamp,
        endedAt: session.end_timestamp,
        durationSeconds: session.duration_seconds,
        drowsinessEventCount: session.drowsiness_event_count,
        possibleYawningEventCount: session.possible_yawning_event_count,
        sessionStatus: session.session_status,
        createdAt: serverTimestamp(),
      });

      // 2. Save individual events in subcollection
      for (const evt of session.events) {
        const evtRef = doc(db, 'users', userId, 'sessions', session.session_id, 'events', evt.id);
        await setDoc(evtRef, {
          type: evt.type,
          timestamp: evt.timestamp,
          durationMs: evt.duration_ms,
          metricValue: evt.metric_value,
          details: evt.details,
        });
      }
      return { success: true };
    } else {
      // Fallback: save to user-scoped local storage
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const existingJson = localStorage.getItem(storageKey);
      const sessions: SessionSummary[] = existingJson ? JSON.parse(existingJson) : [];
      // Deduplicate by session_id
      const filtered = sessions.filter(s => s.session_id !== session.session_id);
      filtered.unshift({ ...session, userId });
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to save session summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}

/**
 * Retrieve user's session history.
 */
export async function getUserSessions(userId: string): Promise<SessionSummary[]> {
  try {
    if (isFirebaseConfigured && db) {
      const sessionsCol = collection(db, 'users', userId, 'sessions');
      const q = query(sessionsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const results: SessionSummary[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        results.push({
          session_id: docSnap.id,
          start_timestamp: data.startedAt,
          end_timestamp: data.endedAt,
          duration_seconds: data.durationSeconds || 0,
          drowsiness_event_count: data.drowsinessEventCount || 0,
          possible_yawning_event_count: data.possibleYawningEventCount || 0,
          session_status: data.sessionStatus || 'COMPLETED',
          events: [], // Sub-events can be fetched on demand for detail view
          userId,
        });
      }
      return results;
    } else {
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const existingJson = localStorage.getItem(storageKey);
      if (!existingJson) return [];
      return JSON.parse(existingJson);
    }
  } catch (error) {
    console.warn('Error loading session history, falling back to local store:', error);
    const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const existingJson = localStorage.getItem(storageKey);
    return existingJson ? JSON.parse(existingJson) : [];
  }
}

/**
 * Delete a session record.
 */
export async function deleteUserSession(
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    if (isFirebaseConfigured && db) {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      await deleteDoc(sessionRef);
    }
    // Also clean local store
    const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const existingJson = localStorage.getItem(storageKey);
    if (existingJson) {
      const sessions: SessionSummary[] = JSON.parse(existingJson);
      const filtered = sessions.filter(s => s.session_id !== sessionId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    }
    return true;
  } catch (e) {
    console.error('Failed to delete session:', e);
    return false;
  }
}
