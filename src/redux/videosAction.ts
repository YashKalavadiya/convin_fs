import {
    CardActionType,
    DirActionType,
    Card,
    StateType,
    GenericActionType,
} from "./../@types/global.types";
import {
    ADD_CARD,
    FETCH_CURRENT_CARDS,
    FETCH_CURRENT_DIRECTORIES,
    POP_DIR,
    PUSH_DIR,
    PUSH_DIR_IN_DIRS,
    UPDATE_CARD,
} from "./videosTypes";
import { Dispatch } from "redux";
import { child, get, ref, remove, set } from "firebase/database";
import { db } from "../firebase";
import { v4 } from "uuid";

const setNewCards = (cards: Card[]): CardActionType => {
    return {
        type: FETCH_CURRENT_CARDS,
        payload: cards,
    };
};

const setNewDirs = (dirs: string[]): DirActionType => {
    return {
        type: FETCH_CURRENT_DIRECTORIES,
        payload: dirs,
    };
};

const pushDir = (dir: string): GenericActionType => {
    return {
        type: PUSH_DIR,
        payload: dir,
    };
};

const pushDirInDirs = (dir: string): GenericActionType => {
    return {
        type: PUSH_DIR_IN_DIRS,
        payload: dir,
    };
};

const popDir = (): GenericActionType => {
    return {
        type: POP_DIR,
        payload: "",
    };
};

export const deleteFromFirebase = async (
    currentDir: string,
    items: string[]
) => {
    try {
        const baseRef = ref(db, "/dirs/" + currentDir);
        for (let i = 0; i < items.length; i++) {
            console.log("DELETING: ", items[i]);
            await remove(child(baseRef, items[i]));
        }
    } catch (err) {
        console.log(err);
    }
};

const deleteCards = (
    state: StateType,
    dispatch: Dispatch,
    cardIds: string[]
) => {
    console.log("BEFORE DEL: ", state.cards);
    const afterDeletedCards = state.cards.filter(
        (val) => !cardIds.includes(val.id)
    );
    console.log("AFTER DEL: ", afterDeletedCards);
    dispatch(setNewCards(afterDeletedCards));
};

const deleteDir = (state: StateType, dispatch: Dispatch, dirs: string[]) => {
    const afterDeleteDirs = state.dirs.filter((val) => !dirs.includes(val));
    dispatch(setNewDirs(afterDeleteDirs));
};

const pushCard = (card: Card): GenericActionType => {
    return {
        type: ADD_CARD,
        payload: card,
    };
};

const updateCard = (newCard: Card, idx: number): GenericActionType => {
    return {
        type: UPDATE_CARD,
        payload: {
            newCard,
            idx,
        },
    };
};

export const updateCardData = async (
    state: StateType,
    dispatch: Dispatch,
    idx: number,
    newCard: Card
) => {
    const prevKey = state.cards[idx].id;
    console.log(prevKey);
    await set(ref(db, "/cards/" + prevKey), {
        name: newCard.name,
        videoURL: newCard.videoURL,
    });

    dispatch(updateCard(newCard, idx));
};

export const addDir = async (
    state: StateType,
    dispatch: Dispatch,
    dir: string
) => {
    const currentRef = ref(db, "/dirs/" + state.currentDir.slice(1).join("/"));
    await set(child(currentRef, dir), false);
    dispatch(pushDirInDirs(dir));
};

export const addCard = async (
    state: StateType,
    dispatch: Dispatch,
    card: Card,
    isNewId: Boolean = true
) => {
    if (isNewId) {
        card.id = v4();
    }
    const currentRef = ref(db, "/dirs/" + state.currentDir.slice(1).join("/"));
    const cardRef = ref(db, "/cards");
    await set(child(currentRef, "card_" + card.id), true);
    if (isNewId) {
        await set(child(cardRef, card.id), {
            name: card.name,
            videoURL: card.videoURL,
        });
    }
    dispatch(pushCard(card));
};

export const deleteItems = async (
    state: StateType,
    dispatch: Dispatch,
    dirs: string[],
    cardIds: string[]
) => {
    await deleteFromFirebase(state.currentDir.slice(1).join("/"), [
        ...dirs,
        ...cardIds.map((val) => "card_" + val),
    ]);
    deleteDir(state, dispatch, dirs);
    deleteCards(state, dispatch, cardIds);
};

export const changeDir = async (
    state: StateType,
    isPOP: Boolean = false,
    dispatch: Dispatch,
    newDir: string = ""
) => {
    if (isPOP) {
        dispatch(popDir());
    } else {
        dispatch(pushDir(newDir));
    }
};

export const fetchDir = async (dispatch: Dispatch, state: StateType) => {
    try {
        const dbref = ref(db, "/dirs/" + state.currentDir.slice(1).join("/"));
        const data = (await get(dbref)).val();
        const keys = Object.keys(data);
        let cardKeys = keys.filter((val) => val.includes("card_"));
        const dirs: string[] = keys.filter((val) => !val.includes("card_"));

        cardKeys = cardKeys.map((val) => val.split("_")[1]);

        const cards: Card[] = [];
        const cardRef = ref(db, "/cards");
        for (let i = 0; i < cardKeys.length; i++) {
            cards.push({
                ...(await get(child(cardRef, cardKeys[i]))).val(),
                id: cardKeys[i],
            });
        }
        dispatch(setNewCards(cards));
        dispatch(setNewDirs(dirs));
    } catch (err) {
        console.log(err);
    }
};
