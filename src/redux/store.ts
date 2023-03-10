import { applyMiddleware, createStore } from "redux";
import videosReducer from "./videosReducer";
import logger from "redux-logger";
import thunk from "redux-thunk";

const store = createStore(videosReducer, applyMiddleware(logger, thunk));

export default store;
