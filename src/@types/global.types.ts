export type Card = {
    name: string;
    videoURL: string;
    id: string;
};

export type CardActionType = {
    type: string;
    payload: Card[];
};

export type DirActionType = {
    type: string;
    payload: string[];
};

export type StateType = {
    currentDir: string[];
    cards: Card[];
    dirs: string[];
};

export type GenericActionType = {
    type: string;
    payload: any;
};
