function setupBoardColors() {
    var board = document.getElementById('chessBoard');

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
    pawnCreator(true, new Coordinate(0,1));
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
}

var Board = [[],[],[],[],[],[],[],[]] 

class Coordinate {
    constructor(x:number, y:number) {
        this.X = x;
        this.Y = y;
    }
    X : number;
    Y : number;
}

var theLegend;
var desti = new Coordinate(0,4);

class Piece {
    constructor(IsWhite : boolean, CurrentPosition : Coordinate, Name : String) {
        this.IsWhite = IsWhite;
        this.CurrentPosition = CurrentPosition;
        this.Name = Name
    }
    
    IsWhite : boolean;
    HasBeenMoved : boolean = false;
    LegalMoves : Array<Coordinate> = [];
    CurrentPosition : Coordinate;
    Name : String;
}

function moveLikePawn(self : Piece) {
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
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y+1));

                    if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 2] === undefined && self.HasBeenMoved === false) {
                        self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y+2));
                    }
                }
                
            } else {
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
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y+1));

                    if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 2] === undefined && self.HasBeenMoved === false) {
                        self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y-2));
                    }
                } 
            } 

        }
    }
}

// function MoveLikeRook(self : Piece) {
//     return {
//         addLegalRookMoves: () => {

//         }
//     }
// }

function pawnCreator(IsWhite : boolean, CurrentPosition : Coordinate) {
    var piece = new Piece(IsWhite, CurrentPosition, "Pawn");
    var pawnObject = {
        ...piece,
        ...moveLikePawn(piece)
    }

    pawnObject.addLegalPawnMoves();
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = pawnObject;
    theLegend = pawnObject;
}




function drawBoard() {    
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                console.log("defined found at " + row + "-" + col);
                var visualCell = document.getElementById(`row-${row+1}`).children[col];
                
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

function getLogicalCell(coordinate : Coordinate) {
    return Board[coordinate.X][coordinate.Y];
}

function getVisualCell(coordinate : Coordinate) {
    return document.getElementById(`row-${coordinate.Y+1}`).children[coordinate.X];
}

function removeVisualCell(cellCoordinate : Coordinate) {
    var visualCell = getVisualCell(cellCoordinate);
    if (visualCell.children.length != 0) {
        visualCell.removeChild(visualCell.firstElementChild);
    }
}

function updateCell(piece : Piece, destination : Coordinate) {
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = undefined;
    piece.CurrentPosition = destination;
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}

function drawVisualCell(cellCoordinate : Coordinate) {
    var visualCell = getVisualCell(cellCoordinate);
    var logicalCell = getLogicalCell(cellCoordinate);

    while (visualCell.children.length != 0) 
        visualCell.removeChild(visualCell.firstElementChild);

    var visualCellImage = document.createElement("img");
    visualCellImage.setAttribute("src", `./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg`);
    visualCellImage.setAttribute("class", "piece");
    visualCell.appendChild(visualCellImage);
}

function movePiece(piece : Piece, destination : Coordinate) {
    removeVisualCell(piece.CurrentPosition);
    updateCell(piece, destination)
    drawVisualCell(piece.CurrentPosition);
}

function highlightLegalMoves(piece : Piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className += " legalMove";
    }
}

function unhighlightLegalMoves(piece : Piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className = visualCell.className.replace(" legalMove", "");
    }
}

function makePieceDraggable() {
    document.addEventListener("dragstart", (e : DragEvent) => {
        console.log("drag start!");
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;

        var piece : Piece = Board[colIndex][rowIndex];
        highlightLegalMoves(piece);
        
        
    });

    // document.addEventListener("drag", (e) => {
    //     console.log("drag middle!");

    // });

    document.addEventListener("dragend", (e) => {
        console.log("drag end!");
        console.log(e);
        
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        

        var piece : Piece = Board[colIndex][rowIndex];
        console.log(piece);
        
        unhighlightLegalMoves(piece);
        
    });
}

function makeCellsLandable() {
    document.addEventListener("dragenter", function(e) {

    });
      
      // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
    document.addEventListener("dragover", function(e) {
        e.preventDefault();

        
    });
      
      // When the draggable p element leaves the droptarget, reset the DIVS's border style
    document.addEventListener("dragleave", function(e) {
        console.log("dragleave!");
        
    });
}

initGame();