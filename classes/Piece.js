"use strict";
exports.__esModule = true;
exports.Piece = void 0;
var Piece = /** @class */ (function () {
    function Piece(color, CurrentPosition, Name) {
        this.HasBeenMoved = false;
        this.JustMadeFirstMove = false;
        this.LegalMoves = [];
        this.Moves = [];
        this.Color = color;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name;
    }
    return Piece;
}());
exports.Piece = Piece;
