import { GenericActionType, StateType } from "../@types/global.types";
import {
    FETCH_CURRENT_DIRECTORIES,
    FETCH_CURRENT_CARDS,
    PUSH_DIR,
    POP_DIR,
    ADD_CARD,
    PUSH_DIR_IN_DIRS,
    UPDATE_CARD,
} from "./videosTypes";

const initialState: StateType = {
    currentDir: ["/dirs"],
    cards: [],
    dirs: [],
};

const videosReducer = (
    state: StateType = initialState,
    action: GenericActionType
) => {
    switch (action.type) {
        case FETCH_CURRENT_DIRECTORIES:
            return {
                ...state,
                dirs: action.payload,
            };
        case FETCH_CURRENT_CARDS:
            return {
                ...state,
                cards: action.payload,
            };
        case PUSH_DIR:
            return {
                ...state,
                currentDir: [...state.currentDir, action.payload],
            };
        case POP_DIR:
            return {
                ...state,
                currentDir: [
                    ...state.currentDir.slice(0, state.currentDir.length - 1),
                ],
            };
        case ADD_CARD:
            return {
                ...state,
                cards: [...state.cards, action.payload],
            };
        case PUSH_DIR_IN_DIRS:
            return {
                ...state,
                dirs: [...state.dirs, action.payload],
            };
        case UPDATE_CARD:
            return {
                ...state,
                cards: [
                    ...state.cards.slice(0, action.payload.idx),
                    action.payload.newCard,
                    ...state.cards.slice(action.payload.idx + 1),
                ],
            };
        default:
            return state;
    }
};

export default videosReducer;
