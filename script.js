"use strict"

const countriesContainer = document.querySelector(".countries");

const getCountry = function(countryName){
    const request = new XMLHttpRequest();
    request.open("GET", `https://restcountries.com/v3.1/name/${countryName}`);
    request.send();
    request.addEventListener("load", function(){
        const [data] = JSON.parse(this.responseText);
    
        const html = `
        <div class="country">
            <img class="country__img" src="${data.flags.svg}" alt="">
            <div class="country__data">
                <h3 class="country__name">${data.name.common}</h3>
                <h4 class="country__region">${data.region}</h4>
                <p class="country__row"><span>🧑‍🤝‍🧑 </span>${(+data.population/1000000).toFixed(1)} millions</p>
                <p class="country__row"><span>🗣 </span>${Object.values(data.languages)[0]}</p>
                <p class="country__row"><span>💰 </span>${Object.values(data.currencies)[0].name}, 
                ${Object.values(data.currencies)[0].symbol}</p>
                <p class="country__row">
                    <a href="https://en.wikipedia.org/wiki/${countryName}">Learn more</a>
                </p>
                <button class="country__button">Remove</button>
            </div>

        </div>`
    
        countriesContainer.insertAdjacentHTML("beforeend", html);

        const newButton = countriesContainer.lastElementChild.querySelector(".country__button");
        newButton.addEventListener("click", removeCountry);
    });
}

function removeCountry(e){
    const currentButton = e.currentTarget;
    currentButton.closest(".country").remove();
}

function addNewCountry(e){
    const input = document.querySelector(".input__box");
    const countryName = input.value.toLowerCase();
    getCountry(countryName);
    input.value = "";
}

const addButton = document.querySelector(".input__button");
addButton.addEventListener("click", addNewCountry)