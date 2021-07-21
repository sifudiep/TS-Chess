export class Piece {
    constructor(IsWhite, CurrentPosition, Name) {
        this.HasBeenMoved = false;
        this.LegalMoves = [];
        this.IsWhite = IsWhite;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name;
    }
}
