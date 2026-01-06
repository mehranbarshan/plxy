
'use client';

import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot,
    serverTimestamp,
    Firestore
} from 'firebase/firestore';
import type { ChatMessage } from '@/lib/types';

// Note: This service is a placeholder and does not connect to a real Firestore instance.
// In a real application, you would pass a Firestore instance to these functions.

const MOCK_USERid = "mock_user_123";

/**
 * Adds a new message to the user's chat history in Firestore.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user.
 * @param message - The message object to add.
 */
export async function addChatMessage(db: Firestore, userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
        const docRef = await addDoc(collection(db, `users/${userId}/chats`), {
            ...message,
            timestamp: serverTimestamp()
        });
        console.log("Message written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

/**
 * Listens for real-time updates to the user's chat history.
 * @param db - The Firestore instance.
 * @param userId - The ID of the user.
 * @param callback - A function to be called with the array of messages.
 * @returns An unsubscribe function.
 */
export function getChatHistory(db: Firestore, userId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
        collection(db, `users/${userId}/chats`), 
        orderBy("timestamp", "asc"), 
        limit(20) // Get the last 20 messages
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp?.toMillis() || Date.now()
            });
        });
        callback(messages);
    }, (error) => {
        console.error("Error getting chat history: ", error);
    });

    return unsubscribe;
}
