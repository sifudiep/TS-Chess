import { Piece } from "./classes/Piece.js";
import { Coordinate } from "./classes/Coordinate.js";
function setupBoardColors() {
    var board = document.getElementById('chessBoard');
    if (board == null)
        throw Error;
    var lightColor = true;
    for (var i = 0; i < board.children.length; i++) {
        var row = board.children[i];
        for (var j = 0; j < row.children.length; j++) {
            lightColor ? row.children[j].className += ' ligth-cell' : row.children[j].className += ' dark-cell';
            lightColor ? lightColor = false : lightColor = true;
        }
        lightColor ? lightColor = false : lightColor = true;
    }
}
function initGame() {
    setupBoardColors();
    pawnCreator(true, new Coordinate(0, 1));
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
}
var Board = [[], [], [], [], [], [], [], []];
var theLegend;
var desti = new Coordinate(0, 4);
let lastTouchedPiece;
function moveLikePawn(self) {
    return {
        addLegalPawnMoves: () => {
            if (self.IsWhite) {
                // if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1] !== undefined) {
                //     if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1].IsWhite === false){
                //         self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y+1));
                //     }
                // }
                // if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1] !== undefined) {
                //     if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1].IsWhite === false){
                //         self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y+1));
                //     }
                // }
                if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 1] === undefined) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 1));
                    if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 2] === undefined && self.HasBeenMoved === false) {
                        self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 2));
                    }
                }
            }
            else {
                // if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1] !== undefined) {
                //     if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1].IsWhite === true){
                //         self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y-1));
                //     }
                // }
                // if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1] !== undefined) {
                //     if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1].IsWhite === true){
                //         self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y-1));
                //     }
                // }
                if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 1] === undefined) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 1));
                    if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 2] === undefined && self.HasBeenMoved === false) {
                        self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y - 2));
                    }
                }
            }
        }
    };
}
// function MoveLikeRook(self : Piece) {
//     return {
//         addLegalRookMoves: () => {
//         }
//     }
// }
function pawnCreator(IsWhite, CurrentPosition) {
    var piece = new Piece(IsWhite, CurrentPosition, "Pawn");
    var pawnObject = Object.assign(Object.assign({}, piece), moveLikePawn(piece));
    pawnObject.addLegalPawnMoves();
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = pawnObject;
    theLegend = pawnObject;
}
function drawBoard() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                const rowElement = document.getElementById(`row-${row + 1}`);
                if (rowElement == null)
                    throw Error;
                var visualCell = rowElement.children[col];
                if (visualCell.children.length === 0) {
                    var visualCellImage = document.createElement("img");
                    var color = logicalCell.IsWhite ? "light" : "dark";
                    var pieceName = logicalCell.Name.toLowerCase();
                    visualCellImage.setAttribute("src", `./pieces/${color}-${pieceName}.svg`);
                    visualCellImage.setAttribute("class", "piece");
                    visualCell.appendChild(visualCellImage);
                }
            }
        }
    }
}
function getLogicalCell(coordinate) {
    return Board[coordinate.X][coordinate.Y];
}
function getVisualCell(coordinate) {
    const rowElement = document.getElementById(`row-${coordinate.Y + 1}`);
    if (rowElement != null)
        return rowElement.children[coordinate.X];
    else
        throw Error;
}
function removeVisualCell(cellCoordinate) {
    var visualCell = getVisualCell(cellCoordinate);
    if (visualCell.firstElementChild != null) {
        visualCell.removeChild(visualCell.firstElementChild);
    }
}
function updatePiecePosition(piece, destination) {
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = undefined;
    piece.CurrentPosition = destination;
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function drawVisualCell(piece) {
    var visualCell = getVisualCell(piece.CurrentPosition);
    var logicalCell = getLogicalCell(piece.CurrentPosition);
    if (logicalCell == undefined)
        throw Error;
    while (visualCell.firstElementChild != null)
        visualCell.removeChild(visualCell.firstElementChild);
    var visualCellImage = document.createElement("img");
    visualCellImage.setAttribute("src", `./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg`);
    visualCellImage.setAttribute("class", "piece");
    visualCell.appendChild(visualCellImage);
}
function movePiece(piece, destination) {
    removeVisualCell(piece.CurrentPosition);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
}
function updateLegalMoves(piece) {
    piece.LegalMoves = [];
    // använd addLegalPawnMoves() på ngt sätt....
}
function highlightLegalMoves(piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className += " legalMove";
    }
}
function unhighlightLegalMoves(piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className = visualCell.className.replace(" legalMove", "");
    }
}
function makePieceDraggable() {
    document.addEventListener("dragstart", (e) => {
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        var piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        highlightLegalMoves(piece);
        lastTouchedPiece = piece;
    });
    //     // document.addEventListener("drag", (e) => {
    //     //     console.log("drag middle!");
    //     // });
    document.addEventListener("dragend", (e) => {
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        var piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        unhighlightLegalMoves(piece);
    });
}
function makeCellsLandable() {
    //   // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
    document.addEventListener("dragover", function (e) {
        e.preventDefault();
    });
    // two different depending if target is an image or target is the div parent...
    document.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!e)
            return false;
        console.log(e);
        if (e.target.className.includes("legalMove")) {
            let dropCoordinate = getCoordinateFromElement(e.target);
            console.log(lastTouchedPiece);
            console.log(`dropCoordinate, X:${dropCoordinate.X}, Y:${dropCoordinate.Y}`);
            movePiece(lastTouchedPiece, dropCoordinate);
            unhighlightLegalMoves(lastTouchedPiece);
            updateLegalMoves(lastTouchedPiece);
        }
    });
}
function getCoordinateFromElement(element) {
    let cellDiv;
    if (element.nodeName === "DIV") {
        cellDiv = element;
    }
    else if (element.nodeName === "IMG") {
        cellDiv = element.parentElement;
    }
    else {
        throw Error;
    }
    const rowIndex = parseInt(cellDiv.getAttribute("row")) - 1;
    const colIndex = parseInt(cellDiv.id.replace("col-", "")) - 1;
    console.log(`colIndex: ${colIndex}, rowIndex: ${rowIndex}`);
    return new Coordinate(colIndex, rowIndex);
}
initGame();
