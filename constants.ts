import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const PADDING = 16;
export const CONTAINER_WIDTH = SCREEN_WIDTH - PADDING * 2;
export const COLUMNS = 2;
export const CARD_WIDTH_PCT = 0.48;
export const CARD_WIDTH = CONTAINER_WIDTH * CARD_WIDTH_PCT;
export const COLUMN_GAP = CONTAINER_WIDTH * (1 - CARD_WIDTH_PCT * 2);
export const ROW_HEIGHT = 128 + 16; // h-32 (128px) + mb-4 (16px)
export const LONG_PRESS_DURATION = 250;
export const WOBBLE_DURATION = 100;
