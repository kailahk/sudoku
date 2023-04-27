/*----- constants -----*/
const dateToShow = new Date()
const month = getMonthName(dateToShow.getMonth())
const day = dateToShow.getDate()
const year = dateToShow.getFullYear()


/*----- state variables -----*/
let X;

/*----- cached elements  -----*/
const dateEl = document.getElementById('date')


/*----- event listeners -----*/
document.getElementById('home-buttons').addEventListener('click', handleHomeButtonClick)


/*----- functions -----*/
function getMonthName(monthNumber) {
    dateToShow.setMonth(monthNumber);
    return dateToShow.toLocaleString('en-US', { month: 'long' });
}
dateEl.innerHTML = `${month} ${day}, ${year}`

function handleHomeButtonClick(event) {
    if (event.target.type !== 'submit') return
    if (event.target.innerHTML === 'Hard') {
        X = 50
    } else if (event.target.innerHTML === 'Medium') {
        X = 45
    } else {
        X = 40
    }
    localStorage.setItem("localStorageX", X)
}

