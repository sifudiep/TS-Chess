import { Coordinate } from "./Coordinate.js";
import { PieceColor } from "../enum/PieceColor.js";

export class Piece {
    constructor(color : PieceColor, CurrentPosition : Coordinate, Name : String) {
        this.Color = color;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name
    }
    
    Color : PieceColor;
    HasBeenMoved : boolean = false;
    JustMadeFirstMove : boolean = false;
    LegalMoves : Array<Coordinate> = [];
    CurrentPosition : Coordinate;
    Name : String;
    Moves : Array<any> = [];

}