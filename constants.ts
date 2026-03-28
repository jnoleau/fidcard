import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const PADDING = 16;
export const CONTAINER_WIDTH = SCREEN_WIDTH - PADDING * 2;
export const COLUMNS = 2;
export const GAP = 12;
export const CARD_WIDTH = (CONTAINER_WIDTH - GAP) / COLUMNS;
export const ROW_HEIGHT = 128;
export const LONG_PRESS_DURATION = 250;
export const WOBBLE_DURATION = 100;
