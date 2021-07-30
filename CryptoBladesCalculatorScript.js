// ==UserScript==
// @name         CryptoBlades Fight Probability Calculator
// @namespace    PHANzgz
// @version      0.5
// @description  (BETA) Simulates fights on cryptoblades and calculates probability of winning for each enemy
// @author       PHANzgz
// @match        https://app.cryptoblades.io
// @include      https://app.cryptoblades.io/#/combat
// @icon         https://app.cryptoblades.io/favicon-32x32.png
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var heroTraits ={
    "earth-icon trait-icon": 0,
    "lightning-icon trait-icon": 1,
    "water-icon trait-icon": 2,
    "fire-icon trait-icon": 3
};

var enemyTraits ={
    "earth-icon": 0,
    "lightning-icon": 1,
    "water-icon": 2,
    "fire-icon": 3
};

var weaponTraits = enemyTraits;
/*
var weaponTraits ={
    "mr-1 icon dex-icon": 0,
    "mr-1 icon cha-icon": 1,
    "mr-1 icon int-icon": 2,
    "mr-1 icon str-icon": 3,
    "mr-1 icon pwr-icon": 4,
};
*/

var weaponStatTraits ={
    "dex": 0,
    "cha": 1,
    "int": 2,
    "str": 3,
    "pwr": 4,
};

$(document).ready(function() {

    // Boring button styling

    var button = document.createElement("button");
    button.innerHTML = "Simulate fight";
    button.id = "fightBtn";
    button.style.background = "linear-gradient(180deg,#1f1f22,#181b1e 5%,#18262d)";
    button.style.border = "2px solid #9E8A55";
    button.style.color = "#bfa765";
    button.style.fontWeight = "bold";
    button.style.padding = "15px 200px";
    button.style.display = "flex"
    button.style.margin = "15px auto";
    //button.style.alignItems = "center";
    //button.style.justifyContent = "center";
    button.onmouseenter = function(){
        this.style.background = "linear-gradient(180deg,#333336,#2c2f32 5%,#2c3a41)";
    }
    button.onmouseleave = function(){
        this.style.background = "linear-gradient(180deg,#1f1f22,#181b1e 5%,#18262d)";
    }

    document.querySelector("body > div > div.content.dark-bg-text").prepend(button);


    var data = {};

    // Traits
    const earthTrait = 0;
    const ligthingTrait = 1;
    const waterTrait = 2;
    const fireTrait = 3;
    const powerTrait = 4;


    $('#fightBtn').click(function(){

        // Hero stats

        var raw_heroPower = document.querySelector("span.subtext.subtext-stats > span:nth-child(4)").innerText;
        data.heroPower = parseInt(raw_heroPower.replace(',', ''));

        var raw_heroTrait = document.querySelector("div.character-data-column.dark-bg-text > span.name.bold.character-name > span").className;
        data.heroTrait = heroTraits[raw_heroTrait];

        // Weapon trait
        var raw_weaponTrait = document.querySelector("div.col.weapon-selection > div > div.weapon-icon-wrapper > div > div.glow-container > div.trait > span").className;
        data.weaponTrait = weaponTraits[raw_weaponTrait];

        console.log("here");

        // Weapon stats

        for (let i = 1; i <= 3; i++){

            let raw_stat = document.querySelector(`div.col.weapon-selection > div > div.weapon-icon-wrapper > div > div.stats > div:nth-child(${i}) > span:nth-child(2)`);

            if (raw_stat){
                data[`stat${i}Trait`] = weaponStatTraits[raw_stat.className];
                data[`stat${i}`] = parseInt(raw_stat.innerText.replace(/[^0-9.]/g, ''));
            }
            else {
                data[`stat${i}Trait`] = 0;
                data[`stat${i}`] = 0;
            }


        }

        // Enemies stats
        for (let i = 1; i <= 4; i++){

            let raw_enemyTrait = document.querySelector(`div.enemy-list > div:nth-child(${i}) > div > div.enemy-character > div.encounter-element > span`).className;
            data[`enemy${i}Trait`] = enemyTraits[raw_enemyTrait];

            let raw_enemyPower = document.querySelector(`div.enemy-list > div:nth-child(${i}) > div > div.enemy-character > div.encounter-power`).innerText;
            data[`enemy${i}`] = parseInt(raw_enemyPower.replace(/[^0-9.]/g, ''));

        }

        // Fight simulation
        // Currently bonus power is not supported
        fight(data.heroPower,
              data.heroTrait,
              0, //data.weaponPower,
              data.weaponTrait,
              data.stat1,
              data.stat1Trait,
              data.stat2,
              data.stat2Trait,
              data.stat3,
              data.stat3Trait,
              data.enemy1,
              data.enemy1Trait,
              data.enemy2,
              data.enemy2Trait,
              data.enemy3,
              data.enemy3Trait,
              data.enemy4,
              data.enemy4Trait)

        // Debug
        var strCombatData = JSON.stringify(data);
        //alert(strCombatData);
        console.log(strCombatData);
    });

    // Fight logic
    function fight(heroPower, heroTrait, weaponBonusPower, weaponTrait, stat1Power, stat1Trait, stat2Power, stat2Trait, stat3Power, stat3Trait,
                    enemy1Power, enemy1Trait, enemy2Power, enemy2Trait, enemy3Power, enemy3Trait, enemy4Power, enemy4Trait) {

        let weaponPowerMultiplier = getWeaponPower(weaponTrait, stat1Power, stat1Trait, stat2Power, stat2Trait, stat3Power, stat3Trait);

        let power = (heroPower*weaponPowerMultiplier) + weaponBonusPower;

        let enemy1Min = Math.ceil(enemy1Power - enemy1Power*0.1);
        let enemy1Max = Math.floor(enemy1Power + enemy1Power*0.1);
        let heroEnemy1Min = Math.ceil((power - power*0.1));
        let heroEnemy1Max = Math.floor((power + power*0.1));

        let enemy2Min = Math.ceil(enemy2Power - enemy2Power*0.1);
        let enemy2Max = Math.floor(enemy2Power + enemy2Power*0.1);
        let heroEnemy2Min = Math.ceil((power - power*0.1));
        let heroEnemy2Max = Math.floor((power + power*0.1));

        let enemy3Min = Math.ceil(enemy3Power - enemy3Power*0.1);
        let enemy3Max = Math.floor(enemy3Power + enemy3Power*0.1);
        let heroEnemy3Min = Math.ceil((power - power*0.1));
        let heroEnemy3Max = Math.floor((power + power*0.1));

        let enemy4Min = Math.ceil(enemy4Power - enemy4Power*0.1);
        let enemy4Max = Math.floor(enemy4Power + enemy4Power*0.1);
        let heroEnemy4Min = Math.ceil((power - power*0.1));
        let heroEnemy4Max = Math.floor((power + power*0.1));

        let traitBonus1 = traitBonus(heroTrait, weaponTrait, enemy1Trait);
        let traitBonus2 = traitBonus(heroTrait, weaponTrait, enemy2Trait);
        let traitBonus3 = traitBonus(heroTrait, weaponTrait, enemy3Trait);
        let traitBonus4 = traitBonus(heroTrait, weaponTrait, enemy4Trait);

        let loop = 500;//3000;
        let won1 = 0;
        let won2 = 0;
        let won3 = 0;
        let won4 = 0;
        let randomHeroPower;
        let randomEnemyPower;

        for (let index = 0; index < loop; index++) {
            randomHeroPower = getRandom10(heroEnemy1Min, heroEnemy1Max) * traitBonus1;
            randomEnemyPower = getRandom10(enemy1Min, enemy1Max);
            if(randomHeroPower >= randomEnemyPower) won1++;

            randomHeroPower = getRandom10(heroEnemy2Min, heroEnemy2Max) * traitBonus2;
            randomEnemyPower = getRandom10(enemy2Min, enemy2Max);
            if(randomHeroPower >= randomEnemyPower) won2++;

            randomHeroPower = getRandom10(heroEnemy3Min, heroEnemy3Max) * traitBonus3;
            randomEnemyPower = getRandom10(enemy3Min, enemy3Max);
            if(randomHeroPower >= randomEnemyPower) won3++;

            randomHeroPower = getRandom10(heroEnemy4Min, heroEnemy4Max) * traitBonus4;
            randomEnemyPower = getRandom10(enemy4Min, enemy4Max);
            if(randomHeroPower >= randomEnemyPower) won4++;

        }



        document.querySelector("div.enemy-list > div:nth-child(1) > div > div.victory-chance").innerText = ' ' + ((won1/loop)*100).toFixed(2) + '%'
        document.querySelector("div.enemy-list > div:nth-child(2) > div > div.victory-chance").innerText = ' ' + ((won2/loop)*100).toFixed(2) + '%'
        document.querySelector("div.enemy-list > div:nth-child(3) > div > div.victory-chance").innerText = ' ' + ((won3/loop)*100).toFixed(2) + '%'
        document.querySelector("div.enemy-list > div:nth-child(4) > div > div.victory-chance").innerText = ' ' + ((won4/loop)*100).toFixed(2) + '%'
    }

    function getWeaponPower(weaponTrait, stat1, trait1, stat2, trait2, stat3, trait3) {
        let powerPerPoint = 0.0025;
        let matchingPowerPerPoint = powerPerPoint * 1.07;
        let traitlessPowerPerPoint = powerPerPoint * 1.03;
        let result = 1;

        if (stat1 > 0 && trait1 >= 0) {
            if (trait1 == weaponTrait) result = result + stat1 * matchingPowerPerPoint;
            else if (trait1 == powerTrait) result = result + stat1 * traitlessPowerPerPoint;
            else result = result + stat1 * powerPerPoint;
        }
        if (stat2 > 0 && trait2 >= 0) {
            if (trait2 == weaponTrait) result = result + stat2 * matchingPowerPerPoint;
            else if (trait2 == powerTrait) result = result + stat2 * traitlessPowerPerPoint;
            else result = result + stat2 * powerPerPoint;
        }
        if (stat3 > 0 && trait3 >= 0) {
            if (trait3 == weaponTrait) result = result + stat3 * matchingPowerPerPoint;
            else if (trait3 == powerTrait) result = result + stat3 * traitlessPowerPerPoint;
            else result = result + stat3 * powerPerPoint;
        }
        return result;
    }

    function traitBonus(characterTrait, weaponTrait, monsterTrait) {
        let bonus = 1;
        let oneBonus = 0.075;

        if (characterTrait == weaponTrait) bonus = bonus + oneBonus;
        if (isTraitEffectiveAgainst(characterTrait, monsterTrait)) bonus = bonus + oneBonus;
        if (isTraitWeakAgainst(characterTrait, monsterTrait)) bonus = bonus - oneBonus;
        return bonus;
    }

    function isTraitEffectiveAgainst(trait1, trait2) {
        if (trait1 == fireTrait && trait2 == earthTrait) return true;
        if (trait1 == waterTrait && trait2 == fireTrait) return true;
        if (trait1 == ligthingTrait && trait2 == waterTrait) return true;
        if (trait1 == earthTrait && trait2 == ligthingTrait) return true;
        return false;
    }

    function isTraitWeakAgainst(trait1, trait2) {
        if (trait1 == fireTrait && trait2 == waterTrait) return true;
        if (trait1 == waterTrait && trait2 == ligthingTrait) return true;
        if (trait1 == ligthingTrait && trait2 == earthTrait) return true;
        if (trait1 == earthTrait && trait2 == fireTrait) return true;
        return false;
    }

    function getRandom10(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

});
