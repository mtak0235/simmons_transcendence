import Game from "@root/2_domain/game/game";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";

/* buttons */
const PLAYER_UP = 38; // up arrow
const PLAYER_DOWN = 40; // down arrow
const PAUSE = 32; // space

const gameSettings = atom({
  key: "game",
  default: Game.initial(),
});

const updatedGameSettings = selector({
  key: "updatedGameSettings",
  get: ({ get }) => get(gameSettings),
  set: ({ set }, newValue) => set(gameSettings, newValue),
});

export const useUpdateGame = (game?: Game) => {
  const [g, setGameSettings] = useRecoilState(updatedGameSettings);
  if (!game) return g;
  else setGameSettings(game);
};
