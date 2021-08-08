import { PieceColor } from '../enum/PieceColor';

export interface MoveData {
    coordinate : string;
    turn : PieceColor;
    lobbyId : string;
}