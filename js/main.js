/*----- constants -----*/
const cols = [
    [0, 9, 18, 27, 36, 45, 54, 63, 72],
    [1, 10, 19, 28, 37, 46, 55, 64, 73],
    [2, 11, 20, 29, 38, 47, 56, 65, 74],
    [3, 12, 21, 30, 39, 48, 57, 66, 75],
    [4, 13, 22, 31, 40, 49, 58, 67, 76],
    [5, 14, 23, 32, 41, 50, 59, 68, 77],
    [6, 15, 24, 33, 42, 51, 60, 69, 78],
    [7, 16, 25, 34, 43, 52, 61, 70, 79],
    [8, 17, 26, 35, 44, 53, 62, 71, 80]
]

const boxes = [
    [0, 1, 2, 9, 10, 11, 18, 19, 20],
    [3, 4, 5, 12, 13, 14, 21, 22, 23],
    [6, 7, 8, 15, 16, 17, 24, 25, 26],
    [27, 28, 29, 36, 37, 38, 45, 46, 47],
    [30, 31, 32, 39, 40, 41, 48, 49, 50],
    [33, 34, 35, 42, 43, 44, 51, 52, 53],
    [54, 55, 56, 63, 64, 65, 72, 73, 74],
    [57, 58, 59, 66, 67, 68, 75, 76, 77],
    [60, 61, 62, 69, 70, 71, 78, 79, 80]
]

/*----- state variables -----*/
let timer = '00:00'
let winner = false
let keyboardType = false // false = normal, true = candidate
let highlightedCell = [0, 0]
let answer = [];
let numsToShow = [];
const board = {};

// below code sourced from: https://www.geeksforgeeks.org/program-sudoku-generator/
class Sudoku {

    // Constructor
    constructor(N, K) {
        this.N = N;
        this.K = K;

        // Compute square root of N
        const SRNd = Math.sqrt(N);
        this.SRN = Math.floor(SRNd);

        // Initialize all entries as false to indicate
        // that there are no edges initially
        this.mat = Array.from({
            length: N
        }, () => Array.from({
            length: N
        }, () => 0));
    }

    // Sudoku Generator
    fillValues() {
        // Fill the diagonal of SRN x SRN matrices
        this.fillDiagonal();

        // Fill remaining blocks
        this.fillRemaining(0, this.SRN);

    }

    // Fill the diagonal SRN number of SRN x SRN matrices
    fillDiagonal() {
        for (let i = 0; i < this.N; i += this.SRN) {
            // for diagonal box, start coordinates->i==j
            this.fillBox(i, i);
        }
    }

    // Returns false if given 3 x 3 block contains num.
    unUsedInBox(rowStart, colStart, num) {
        for (let i = 0; i < this.SRN; i++) {
            for (let j = 0; j < this.SRN; j++) {
                if (this.mat[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // Fill a 3 x 3 matrix.
    fillBox(row, col) {
        let num = 0;
        for (let i = 0; i < this.SRN; i++) {
            for (let j = 0; j < this.SRN; j++) {
                while (true) {
                    num = this.randomGenerator(this.N);
                    if (this.unUsedInBox(row, col, num)) {
                        break;
                    }
                }
                this.mat[row + i][col + j] = num;
            }
        }
    }

    // Random generator
    randomGenerator(num) {
        return Math.floor(Math.random() * num + 1);
    }

    // Check if safe to put in cell
    checkIfSafe(i, j, num) {
        return (
            this.unUsedInRow(i, num) &&
            this.unUsedInCol(j, num) &&
            this.unUsedInBox(i - (i % this.SRN), j - (j % this.SRN), num)
        );
    }

    // check in the row for existence
    unUsedInRow(i, num) {
        for (let j = 0; j < this.N; j++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }

    // check in the row for existence
    unUsedInCol(j, num) {
        for (let i = 0; i < this.N; i++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }

    // A recursive function to fill remaining
    // matrix
    fillRemaining(i, j) {
        // Check if we have reached the end of the matrix
        if (i === this.N - 1 && j === this.N) {
            return true;
        }

        // Move to the next row if we have reached the end of the current row
        if (j === this.N) {
            i += 1;
            j = 0;
        }


        // Skip cells that are already filled
        if (this.mat[i][j] !== 0) {
            return this.fillRemaining(i, j + 1);
        }

        // Try filling the current cell with a valid value
        for (let num = 1; num <= this.N; num++) {
            if (this.checkIfSafe(i, j, num)) {
                this.mat[i][j] = num;
                if (this.fillRemaining(i, j + 1)) {
                    return true;
                }
                this.mat[i][j] = 0;
            }
        }

        // No valid value was found, so backtrack
        return false;
    }

    // Print sudoku
    generateBoard() {
        for (let i = 0; i < this.N; i++) {
            answer.push([...this.mat[i]])
        }
        console.log('answer', answer)
    }

    // Remove the K no. of digits to
    // complete game
    removeKDigits() {
        let count = this.K;

        while (count !== 0) {
            // extract coordinates i and j
            let i = Math.floor(Math.random() * this.N);
            let j = Math.floor(Math.random() * this.N);
            if (this.mat[i][j] !== 0) {
                count--;
                this.mat[i][j] = 0;
            }
        }
        numsToShow = this.mat
        console.log('board', numsToShow)
        return;
    }
}





/*----- cached elements  -----*/


/*----- event listeners -----*/


/*----- functions -----*/

function init() {
    function initBoard() {
        let N = 9
        let K = 40
        let sudoku = new Sudoku(N, K)
        sudoku.fillValues()
        sudoku.generateBoard()
        sudoku.removeKDigits()
        initCells()
    }

    function initCells() {
        let i = 0;
        answer.forEach(function (row, rowIdx) {
            row.forEach(function (boardCell, boardCellIdx) {
                board[`R${rowIdx}C${boardCellIdx}`] = {
                    'id': i,
                    'value': boardCell,
                    'numToShow': numsToShow[rowIdx][boardCellIdx] === 0 ? 0 : boardCell,
                    'revealed': numsToShow[rowIdx][boardCellIdx] ? true : false,
                    'candidates': {
                        1: false,
                        2: false,
                        3: false,
                        4: false,
                        5: false,
                        6: false,
                        7: false,
                        8: false,
                        9: false
                    },
                    'row': rowIdx,
                }
                checkColandBox(rowIdx, boardCellIdx, i)
                i++
            })
        })
        console.log(board)
    }

    function checkColandBox(rowNum, cellNum, id) {
        let currCell = board[`R${rowNum}C${cellNum}`]

        cols.forEach(function (column, colIdx) {
            if (column.includes(id)) {
                currCell['col'] = colIdx;
            } 
        });
        boxes.forEach(function (box, boxIdx) {
            if (box.includes(id)) {
                console.log(box, boxIdx, id)
                currCell['box'] = boxIdx
            }
        });
    }

    initBoard();
}

init();
