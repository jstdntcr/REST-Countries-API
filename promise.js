"use strict"

const countriesContainer = document.querySelector(".container");

// public api key
const API_KEY = "e7a78c3c6bdf45fdbcfb1c9e56a79bfc";

// button "+"
const addButton = document.querySelector(".input__button");
addButton.addEventListener("click", addNewCountry);

// input line
const inputBox = document.querySelector(".input__box");

// type of search buttons
const searchByNameButton = document.getElementById("by_name_button");
const searchByCoordinatesButton = document.getElementById("by_coordinates_button");
searchByNameButton.addEventListener("click", changeToSearchingByName)
searchByCoordinatesButton.addEventListener("click", changeToSearchingByCoordinates)

// default settings
let searchTypeFlag = true; // true - by name, false / by coordinates
setActiveButton(searchByNameButton);
setUnactiveButton(searchByCoordinatesButton);
inputBox.placeholder = "INPUT COUNTRY NAME (ex. Spain)";

const displayCountry = function(data){
    const html = `
        <div class="countries">
            <div class="country">
                <img class="country__img" src="${data.flags.svg}" alt="">
                <div class="country__data">
                    <h3 class="country__name">${data.name.common.toUpperCase()}</h3>
                    <h4 class="country__region">${data.region.toUpperCase()}</h4>
                    <p class="country__row"><span>🧑‍🤝‍🧑 </span>${(+data.population/1000000).toFixed(1)} millions</p>
                    <p class="country__row"><span>🗣 </span>${Object.values(data.languages)[0]}</p>
                    <p class="country__row"><span>💰 </span>${Object.values(data.currencies)[0].name}, 
                    ${Object.values(data.currencies)[0].symbol}</p>
                    <p class="country__row">
                        <a target="_blank" href="https://en.wikipedia.org/wiki/${data.name.common.toLowerCase()}">Learn more</a>
                    </p>
                    <button class="country__button">REMOVE</button>
                </div>

            </div>
        </div>`

        countriesContainer.insertAdjacentHTML("beforeend", html);

        const newButton = countriesContainer.lastElementChild.querySelector(".country__button");
        newButton.addEventListener("click", removeCountry);
};

const displayNeighbourCountry = function(data, mainCountryName){
    const html = `
        <div class="country__neighbour">
            <img class="country__img" src="${data.flags.svg}" alt="">
            <div class="country__data">
                <p class="neighbour__data">NEIGHBOUR OF ${mainCountryName.toUpperCase()}</p>
                <h3 class="country__name">${data.name.common.toUpperCase()}</h3>
                <h4 class="country__region">${data.region.toUpperCase()}</h4>
                <p class="country__row"><span>🧑‍🤝‍🧑 </span>${(+data.population/1000000).toFixed(1)} millions</p>
                <p class="country__row"><span>🗣 </span>${Object.values(data.languages)[0]}</p>
                <p class="country__row"><span>💰 </span>${Object.values(data.currencies)[0].name}, 
                ${Object.values(data.currencies)[0].symbol}</p>
                <p class="country__row">
                    <a target="_blank" href="https://en.wikipedia.org/wiki/${data.name.common.toLowerCase()}">Learn more</a>
                </p>
                <button class="country__button">REMOVE</button>
            </div>

        </div>`

        const allCountries = document.querySelectorAll(".countries");
        const mainCountry = allCountries[allCountries.length - 1];
        mainCountry.insertAdjacentHTML("beforeend", html);

        const newButton = mainCountry.lastElementChild.querySelector(".country__button");
        newButton.addEventListener("click", removeCountryNeighbour);
};

const displayError = function(message){
    inputBox.placeholder = message;
    console.log(message);
    setTimeout(() => {
        if (searchTypeFlag) inputBox.placeholder = "INPUT COUNTRY NAME (ex. Spain)";
        else inputBox.placeholder = "INPUT COUNTRY COORDINATES (ex. '52.38 9.73')";
    }, 5000);
};

const getDataAndConvertToJSON = function(url){
    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Something went wrong. Error: ${response.status}`);
        }
        return response.json();
    });
};

const getCountry = function(countryName){
    getDataAndConvertToJSON(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(data => {
            displayCountry(data[0]);
            return data;
        })
        .then(data => {
            // get neighbours
            const mainCountryName = data[0].name.common;
            const neighbours = data[0].borders;
            const neighboursURLs = [];

            if (neighbours){
                neighbours.forEach(neighbour => {
                    neighboursURLs.push(`https://restcountries.com/v3.1/alpha/${neighbour}`)
                });
                
                if (neighboursURLs){
                    neighboursURLs.forEach(url => {
                        getDataAndConvertToJSON(url)
                        .then(data => displayNeighbourCountry(data[0], mainCountryName))
                    })
                }
            }
        })
        .catch(err => {
            displayError(err.message);
        });
}

const getCountryNameByGPS = function(lat, lng){
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${lng}&key=${API_KEY}`
    
    return fetch(url)
        .then(response => response.json())
        .then(data => data.results[0].components.country)
        .catch(err => displayError(err.message));
}

const isValidName = function(input){
    if (/^[a-z]+$/.test(input.toLowerCase())) return true;
    else throw new Error("Country name should consists of letters only.")
}

const isValidCoordinates = function(input){
    if (!/^[0-9. ]+$/.test(input)) throw new Error("Coordinates should consist of numbers, '.' and ' '.");
    const coords = input.split(" ");
    let counter = 0;
    let latitude = null;
    let longitude = null;

    for (let coord of coords){
        if (counter > 1) break;

        if (!counter && coord.length){
            latitude = coord;
            counter++;
            continue;
        }

        if (counter == 1 && coord.length){
            longitude = coord;
            counter++;
            break;
        }
    }

    const countPoints = function(str){
        counter = 0;
        for (let i = 0; i < str.length; i++){
            if (str[i] === ".") counter++;
            if (counter > 1) return false;
        }

        return true;
    }

    if (countPoints(latitude) && countPoints(longitude)) return true;
}

function setActiveButton(button){
    button.classList.remove("unactive__button");
    button.classList.add("active__button");
}

function setUnactiveButton(button){
    button.classList.remove("active__button");
    button.classList.add("unactive__button");
}

function removeCountry(e){
    const currentButton = e.currentTarget;
    currentButton.closest(".countries").remove();
};

function removeCountryNeighbour(e){
    const currentButton = e.currentTarget;
    currentButton.closest(".country__neighbour").remove();
};

function addNewCountry(e){
    const input = document.querySelector(".input__box");

    const inputData = input.value.toLowerCase();
    input.value = "";

    try{
        if (searchTypeFlag){
            if (inputData && isValidName(inputData)) getCountry(inputData);
        } else{
            if (inputData && isValidCoordinates(inputData)){
                const latitude = inputData.substring(0, inputData.indexOf(" "));
                const longitude = inputData.substring(inputData.indexOf(" ") + 1);
    
                return getCountryNameByGPS(latitude, longitude)
                    .then(name => getCountry(name));
            }
        }
    }
    catch(err){
        displayError(err.message);
    };
};

function changeToSearchingByName(){
    setActiveButton(searchByNameButton);
    setUnactiveButton(searchByCoordinatesButton);
    inputBox.placeholder = "INPUT COUNTRY NAME (ex. Spain)";
    searchTypeFlag = true;
}

function changeToSearchingByCoordinates(){
    setActiveButton(searchByCoordinatesButton);
    setUnactiveButton(searchByNameButton);
    inputBox.placeholder = "INPUT COUNTRY COORDINATES (ex. '52.38 9.73')";
    searchTypeFlag = false;
}