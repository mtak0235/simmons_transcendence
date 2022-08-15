import {atom, useRecoilValue} from 'recoil';


const games = atom({key: "games", default: [1,2,3],})

const useDashboard = () => {
    const gameList = useRecoilValue(games);
    return gameList;
};

export default useDashboard;