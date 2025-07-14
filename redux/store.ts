import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/redux/slices/userSlice';
import loadingReducer from '@/redux/slices/loadingSlice';
import reactionTypeReducer from '@/redux/slices/reactionTypeSlice';
import notificationReducer from '@/redux/slices/notificationSlice';
import conversationReducer from '@/redux/slices/conversationSlice';
import relationshipReducer from '@/redux/slices/relationshipSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            loading: loadingReducer,
            reactionType: reactionTypeReducer,
            notification: notificationReducer,
            conversation: conversationReducer,
            relationship: relationshipReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
