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
let timer;
let winner;
let keyboardType; // false = normal, true = candidate
let highlightedCell;
const board = {};
let answer = [];
let numsToShow = [];

// code for Sudoku class sourced from: https://www.geeksforgeeks.org/program-sudoku-generator/
class Sudoku {

    constructor(N, K) {
        this.N = N;
        this.K = K;

        const SRNd = Math.sqrt(N);
        this.SRN = Math.floor(SRNd);

        this.mat = Array.from({
            length: N
        }, () => Array.from({
            length: N
        }, () => 0));
    }

    fillValues() {
        this.fillDiagonal();

        this.fillRemaining(0, this.SRN);

    }

    fillDiagonal() {
        for (let i = 0; i < this.N; i += this.SRN) {
            // for diagonal box, start coordinates->i==j
            this.fillBox(i, i);
        }
    }

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

    randomGenerator(num) {
        return Math.floor(Math.random() * num + 1);
    }

    checkIfSafe(i, j, num) {
        return (
            this.unUsedInRow(i, num) &&
            this.unUsedInCol(j, num) &&
            this.unUsedInBox(i - (i % this.SRN), j - (j % this.SRN), num)
        );
    }

    unUsedInRow(i, num) {
        for (let j = 0; j < this.N; j++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }

    unUsedInCol(j, num) {
        for (let i = 0; i < this.N; i++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }

    fillRemaining(i, j) {
        if (i === this.N - 1 && j === this.N) {
            return true;
        }

        if (j === this.N) {
            i += 1;
            j = 0;
        }

        if (this.mat[i][j] !== 0) {
            return this.fillRemaining(i, j + 1);
        }

        for (let num = 1; num <= this.N; num++) {
            if (this.checkIfSafe(i, j, num)) {
                this.mat[i][j] = num;
                if (this.fillRemaining(i, j + 1)) {
                    return true;
                }
                this.mat[i][j] = 0;
            }
        }

        return false;
    }

    generateBoard() {
        for (let i = 0; i < this.N; i++) {
            answer.push([...this.mat[i]])
        }
    }

    removeKDigits() {
        let count = this.K;

        while (count !== 0) {
            let i = Math.floor(Math.random() * this.N);
            let j = Math.floor(Math.random() * this.N);
            if (this.mat[i][j] !== 0) {
                count--;
                this.mat[i][j] = 0;
            }
        }
        numsToShow = this.mat
        return;
    }
}


/*----- cached elements  -----*/
const allCells = document.getElementById('board')
const timerEl = document.getElementById('timer')
const candidateBtnEl = document.getElementById('candidate')
const normalBtnEl = document.getElementById('normal')
const keyboardEls = document.getElementById('keyboard').children
const highlightedCellEl = document.getElementById(highlightedCell)

/*----- event listeners -----*/
allCells.addEventListener('click', handleHighlightCell)
normalBtnEl.addEventListener('click', handleKeyboardSwitch)
candidateBtnEl.addEventListener('click', handleKeyboardSwitch)
for (let i = 0; i < keyboardEls.length; i++) {
    keyboardEls[i].addEventListener('click', handleNumberClick)
}

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
                    'candidates': [
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false
                    ],
                    'row': rowIdx,
                }
                checkColandBox(rowIdx, boardCellIdx, i)
                let currCell = document.createElement('div');
                currCell.setAttribute('id', `R${rowIdx}C${boardCellIdx}`);
                currCell.setAttribute('class', 'cell')
                allCells.appendChild(currCell);
                let currCellObj = board[`R${rowIdx}C${boardCellIdx}`]
                console.log(rowIdx, boardCellIdx)
                if (rowIdx === 2 || rowIdx === 5) {
                    currCell.style.borderBottom = '.5vmin solid grey'
                }
                if (cols[2].includes(boardCellIdx) || cols[5].includes(boardCellIdx)) {
                    currCell.style.borderRight = '.5vmin solid grey'
                }
                // if (currCellObj.numToShow === 0) {
                //     currCellObj.candidates.forEach(function (candidate, idx) {
                //         if (candidate === true) {
                //             let currCandidate = document.createElement('div')
                //             currCandidate.innerHTML = idx + 1
                //             currCell.appendChild(currCandidate)
                //             currCell.style.fontWeight = '400'
                //         } else {
                //             let noCandidate = document.createElement('div')
                //             noCandidate.innerHTML = ' '
                //             currCell.appendChild(noCandidate)
                //         }
                //     })
                //     currCell.style.fontSize = '1vmin'
                //     currCell.style.display = 'grid'
                //     currCell.style.gridTemplateColumns = 'repeat(3, 2vmin)'
                //     currCell.style.gridTemplateRows = 'repeat(3, 2vmin)'
                // } else {
                currCell.style.fontSize = '3.5vmin'
                // }
                i++
            })
        })
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
                currCell['box'] = boxIdx
            }
        });
    }

    function initTimer() {
        let time = 0;
        function updateTime() {
            let minutes = Math.floor(time / 60);
            let seconds = time % 60;
            time++;
            if (minutes.toString().length < 2) {
                minutes = `0${minutes}`
            }
            if (seconds.toString().length < 2) {
                seconds = `0${seconds}`
            }
            timerEl.innerHTML = `${minutes}:${seconds}`;
        }
        let clock = setInterval(updateTime, 1000);
    }

    function initHighlightedCell() {
        for (let j = 0; j < 81; j++) {
            if (board[Object.keys(board)[j]].numToShow === 0) {
                return highlightedCell = Object.keys(board)[j];
            }
        }
    }

    winner = false;
    keyboardType = false;
    initTimer();
    initBoard();
    highlightedCell = initHighlightedCell();
    console.log(board)
    render();
}

function handleHighlightCell(event) {
    let currCellObj = board[event.target.id]
    if (currCellObj.revealed !== true) {
        highlightedCell = event.target.id;
    }
    render();
}

function handleKeyboardSwitch(event) {
    if (event.target.id === 'normal') {
        keyboardType = false
    }
    if (event.target.id === 'candidate') {
        keyboardType = true
    }
    render();
}

function handleNumberClick(event) {
    if (keyboardType === false) {
        board[highlightedCell].numToShow = event.target.innerHTML
    } else {
        if (board[highlightedCell].candidates[event.target.innerHTML - 1]) {
            if (board[highlightedCell].numToShow === 0) {
                board[highlightedCell].candidates[event.target.innerHTML - 1] = false
            } else {
                board[highlightedCell].numToShow = 0
            }
        } else {
            board[highlightedCell].candidates[event.target.innerHTML - 1] = true;
            board[highlightedCell].numToShow = 0
        }
    }
    render();
}

function render() {
    renderBoard()
    renderKeyboard()

    function renderBoard() {
        for (let id = 0; id < 81; id++) {
            let currCellName = Object.keys(board)[id]
            let currCellObj = board[currCellName]
            let currCell = document.getElementById(currCellName)
            if (currCellObj.numToShow !== 0 && currCellObj.revealed === true) {
                currCell.removeEventListener('click', handleHighlightCell)
                currCell.innerHTML = currCellObj.numToShow;
                currCell.style.backgroundColor = 'rgb(232,232,232)';
            }
            if (currCellObj.numToShow !== 0 && currCellObj.revealed === false) {
                currCell.innerHTML = currCellObj.numToShow;
                currCell.style.fontSize = '2.5vmin'
            }
            if (currCellObj.numToShow === 0) {
                if (currCellObj.candidates.every((candidate) => candidate === false)) {
                    currCell.innerHTML = ''
                } else {
                    renderCandidates(currCellObj, currCell)
                }
            }
            if (currCellObj.id !== highlightedCell && currCellObj.revealed === false) {
                currCell.style.backgroundColor = 'white'
            }
            let highlightedCellEl = document.getElementById(highlightedCell)
            highlightedCellEl.style.backgroundColor = 'gold'
        }
    }

    function renderCandidates(currCellObj, currCell) {
        let candidatesToRender = []
        currCellObj.candidates.forEach((candidate, idx) => candidate === true ? candidatesToRender.push(idx + 1) : candidatesToRender.push(' '))
        candidatesToRender.forEach((candidate, idx) => {
            currCell.innerHTML = candidatesToRender.join('')
            currCell.style.fontSize = '1vmin'
        })
    }


    function renderKeyboard() {
        if (keyboardType) {
            candidateBtnEl.style.backgroundColor = 'black';
            candidateBtnEl.style.color = 'white';
            candidateBtnEl.style.borderColor = 'black'
            normalBtnEl.style.backgroundColor = 'white';
            normalBtnEl.style.color = 'lightgrey';
            normalBtnEl.style.borderColor = 'lightgrey';
            for (let i = 0; i < keyboardEls.length - 1; i++) {
                keyboardEls[i].style.fontSize = '1.3vmin';
                keyboardEls[i].style.height = '5vmin';
            }
        } else {
            candidateBtnEl.style.backgroundColor = 'white';
            candidateBtnEl.style.color = 'lightgrey';
            candidateBtnEl.style.borderColor = 'lightgrey'
            normalBtnEl.style.backgroundColor = 'black';
            normalBtnEl.style.color = 'white';
            normalBtnEl.style.borderColor = 'black'
            for (let i = 0; i < keyboardEls.length; i++) {
                keyboardEls[i].style.fontSize = '2vmin';
            }
        }
    }
}

init();
