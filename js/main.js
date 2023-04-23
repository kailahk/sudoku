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
let columnVals = [];
let boxVals = [];

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
        console.log(board)
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
                    'conflict': false
                }
                checkColandBox(rowIdx, boardCellIdx, i)
                let currCell = document.createElement('div');
                currCell.setAttribute('id', `R${rowIdx}C${boardCellIdx}`);
                currCell.setAttribute('class', 'cell')
                allCells.appendChild(currCell);
                for (let i = 0; i < 9; i++) {
                    currCell.appendChild(document.createElement('div'))
                    currCell.style.display = 'grid'
                }
                currCell.style.gridTemplateColumns = 'repeat(3, 2vmin)'
                currCell.style.gridTemplateRows = 'repeat(3, 2vmin)'
                currCell.children[8].style.backgroundColor = 'red'
                currCell.children[8].style.height = '1vmin'
                currCell.children[8].style.width = '1vmin'
                currCell.children[8].style.borderRadius = '50%'
                currCell.children[8].style.marginLeft = '.5vmin'
                currCell.children[8].style.visibility = 'hidden'
                let currCellObj = board[`R${rowIdx}C${boardCellIdx}`]
                if (rowIdx === 2 || rowIdx === 5) {
                    currCell.style.borderBottom = '.5vmin solid grey'
                }
                if (cols[2].includes(boardCellIdx) || cols[5].includes(boardCellIdx)) {
                    currCell.style.borderRight = '.5vmin solid grey'
                    currCell.style.paddingRight = '.5vmin'
                }
                currCell.style.fontSize = '3.5vmin'
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
    render();
}

function handleHighlightCell(event) {
    if (event.target.id.length && !board[event.target.id].revealed) {
        highlightedCell = event.target.id;
    }
    if (!event.target.id.length) {
        if (!board[event.target.parentElement.id].revealed) {
            highlightedCell = event.target.parentElement.id;
        }
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
        if (event.target.innerHTML === 'X') {
            if (board[highlightedCell].conflict) {
                board[highlightedCell].conflict = false
                let currRow = parseInt(highlightedCell.split('')[1])
                let currCol = parseInt(highlightedCell.split('')[3])
                numsToShow[currRow].forEach((num, idx) => {
                    if (num === board[highlightedCell].numToShow) {
                        board[`R${currRow}C${idx}`].conflict = false
                    }
                })
                columnVals[currCol].forEach((num, idx) => {
                    if (num === board[highlightedCell].numToShow) {
                        board[`R${idx}C${currCol}`].conflict = false
                    }
                })
                let box = board[highlightedCell].box
                boxVals[box].forEach((num, idx) => {
                    console.log(num)
                    if (num === board[highlightedCell].numToShow) {
                        let column;
                        let row;
                        if (box < 3) {
                            row = Math.floor(idx / 3)
                        } else if (box < 6) {
                            row = Math.floor(idx / 3) + 3
                        } else if (box < 9) {
                            row = Math.floor(idx / 3) + 6
                        }
                        if (idx === 0 || idx === 3 || idx === 6) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 0
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 3
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 6
                            }
                        }
                        if (idx === 1 || idx === 4 || idx === 7) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 1
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 4
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 7
                            }
                        }
                        if (idx === 2 || idx === 5 || idx === 8) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 2
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 5
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 8
                            }
                        }
                        let currCell = board[`R${row}C${column}`]
                        currCell.conflict = false
                    }
                })
            }
            if (board[highlightedCell].numToShow === 0) {
                board[highlightedCell].candidates = [false, false, false, false, false, false, false, false, false]
            } else {
                board[highlightedCell].numToShow = 0
                numsToShow[board[highlightedCell].row][board[highlightedCell].col] = 0
            }
        } else {
            if (board[highlightedCell].conflict) {
                board[highlightedCell].conflict = false
                let currRow = parseInt(highlightedCell.split('')[1])
                let currCol = parseInt(highlightedCell.split('')[3])
                numsToShow[currRow].forEach((num, idx) => {
                    if (num === board[highlightedCell].numToShow) {
                        board[`R${currRow}C${idx}`].conflict = false
                    }
                })
                columnVals[currCol].forEach((num, idx) => {
                    if (num === board[highlightedCell].numToShow) {
                        board[`R${idx}C${currCol}`].conflict = false
                    }
                })
                let box = board[highlightedCell].box
                boxVals[box].forEach((num, idx) => {
                    console.log(num)
                    if (num === board[highlightedCell].numToShow) {
                        let column;
                        let row;
                        if (box < 3) {
                            row = Math.floor(idx / 3)
                        } else if (box < 6) {
                            row = Math.floor(idx / 3) + 3
                        } else if (box < 9) {
                            row = Math.floor(idx / 3) + 6
                        }
                        if (idx === 0 || idx === 3 || idx === 6) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 0
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 3
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 6
                            }
                        }
                        if (idx === 1 || idx === 4 || idx === 7) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 1
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 4
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 7
                            }
                        }
                        if (idx === 2 || idx === 5 || idx === 8) {
                            if (box === 0 || box === 3 || box === 6) {
                                column = 2
                            }
                            if (box === 1 || box === 4 || box === 7) {
                                column = 5
                            }
                            if (box === 2 || box === 5 || box === 8) {
                                column = 8
                            }
                        }
                        let currCell = board[`R${row}C${column}`]
                        currCell.conflict = false
                    }
                })
            }
            board[highlightedCell].numToShow = parseInt(event.target.innerHTML)
            numsToShow[board[highlightedCell].row][board[highlightedCell].col] = parseInt(event.target.innerHTML)
        }
    } else {
        if (event.target.innerHTML === 'X') {
            board[highlightedCell].candidates = [false, false, false, false, false, false, false, false, false]
        }
        if (board[highlightedCell].candidates[event.target.innerHTML - 1]) {
            if (board[highlightedCell].numToShow === 0) {
                board[highlightedCell].candidates[event.target.innerHTML - 1] = false
            } else {
                board[highlightedCell].numToShow = 0
                numsToShow[board[highlightedCell].row][board[highlightedCell].col] = 0
            }
        } else {
            board[highlightedCell].candidates[event.target.innerHTML - 1] = true;
            board[highlightedCell].numToShow = 0
            numsToShow[board[highlightedCell].row][board[highlightedCell].col] = 0
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
            checkConflicts()
            if (currCellObj.numToShow !== 0) {
                currCell.children[4].innerHTML = currCellObj.numToShow;
                if (currCellObj.revealed === true) {
                    currCell.style.backgroundColor = 'rgb(232,232,232)';
                } else {
                    currCell.style.fontSize = '3.5vmin'
                }
            }
            if (currCellObj.numToShow === 0) {
                if (currCellObj.candidates.every((candidate) => candidate === false)) {
                    currCell.children[4].innerHTML = ''
                } else {
                    renderCandidates(currCellObj, currCell)
                }
            }
            if (currCellObj.id !== highlightedCell && currCellObj.revealed === false) {
                currCell.style.backgroundColor = 'white'
            }
            if (currCellObj.conflict) {
                currCell.children[8].style.visibility = 'visible'
            } else {
                currCell.children[8].style.visibility = 'hidden'
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

    function checkConflicts() {
        let newCols = [];
        let newBoxes = [];
        numsToShow.forEach((row, idx1) => {
            let countOfEachNum = {}
            row.forEach((num, idx2) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
                if (newCols[idx2]) {
                    newCols[idx2].push(num)
                } else {
                    newCols[idx2] = [num]
                }
                if (idx1 < 3) {
                    if (idx2 < 3) {
                        newBoxes[0] ? newBoxes[0].push(num) : newBoxes[0] = [num]
                    } else if (idx2 < 6) {
                        newBoxes[1] ? newBoxes[1].push(num) : newBoxes[1] = [num]
                    } else if (idx2 < 9) {
                        newBoxes[2] ? newBoxes[2].push(num) : newBoxes[2] = [num]
                    }
                } else if (idx1 < 6) {
                    if (idx2 < 3) {
                        newBoxes[3] ? newBoxes[3].push(num) : newBoxes[3] = [num]
                    } else if (idx2 < 6) {
                        newBoxes[4] ? newBoxes[4].push(num) : newBoxes[4] = [num]
                    } else if (idx2 < 9) {
                        newBoxes[5] ? newBoxes[5].push(num) : newBoxes[5] = [num]
                    }
                } else if (idx1 < 9) {
                    if (idx2 < 3) {
                        newBoxes[6] ? newBoxes[6].push(num) : newBoxes[6] = [num]
                    } else if (idx2 < 6) {
                        newBoxes[7] ? newBoxes[7].push(num) : newBoxes[7] = [num]
                    } else if (idx2 < 9) {
                        newBoxes[8] ? newBoxes[8].push(num) : newBoxes[8] = [num]
                    }
                }
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    row.forEach((num, idx3) => {
                        let currCell = board[`R${idx1}C${idx3}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
        columnVals = newCols
        newCols.forEach((column, idx4) => {
            let countOfEachNum = {}
            column.forEach((num, idx5) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    column.forEach((num, idx6) => {
                        currCell = board[`R${idx6}C${idx4}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
        boxVals = newBoxes
        newBoxes.forEach((box, idx7) => {
            let countOfEachNum = {}
            box.forEach((num, idx8) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    box.forEach((num, idx9) => {
                        let column;
                        let row;
                        if (idx7 < 3) {
                            row = Math.floor(idx9 / 3)
                        } else if (idx7 < 6) {
                            row = Math.floor(idx9 / 3) + 3
                        } else if (idx7 < 9) {
                            row = Math.floor(idx9 / 3) + 6
                        }
                        if (idx9 === 0 || idx9 === 3 || idx9 === 6) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 0
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 3
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 6
                            }
                        }
                        if (idx9 === 1 || idx9 === 4 || idx9 === 7) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 1
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 4
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 7
                            }
                        }
                        if (idx9 === 2 || idx9 === 5 || idx9 === 8) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 2
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 5
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 8
                            }
                        }
                        currCell = board[`R${row}C${column}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
    }
}

init();
