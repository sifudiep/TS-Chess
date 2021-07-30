"use strict";
exports.__esModule = true;
exports.Piece = void 0;
var Piece = /** @class */ (function () {
    function Piece(IsWhite, CurrentPosition, Name) {
        this.HasBeenMoved = false;
        this.JustMadeFirstMove = false;
        this.LegalMoves = [];
        this.Moves = [];
        this.IsWhite = IsWhite;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name;
    }
    return Piece;
}());
exports.Piece = Piece;
