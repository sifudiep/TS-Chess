export class Piece {
    constructor(IsWhite, CurrentPosition, Name) {
        this.HasBeenMoved = false;
        this.LegalMoves = [];
        this.Moves = [];
        this.IsWhite = IsWhite;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name;
    }
}
