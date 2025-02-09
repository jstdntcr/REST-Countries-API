"use strict"

const countriesContainer = document.querySelector(".container");

const addButton = document.querySelector(".input__button");
addButton.addEventListener("click", addNewCountry);

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
    const countryName = input.value.toLowerCase();
    if (countryName) getCountry(countryName);
    input.value = "";
};

const displayError = function(message){
    const inputBox = document.querySelector(".input__box");
    inputBox.placeholder = message;
    console.log(message);
    setTimeout(() => inputBox.placeholder = "INPUT COUNTRY NAME", 5000);
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