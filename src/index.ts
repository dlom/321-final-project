import { createConnection } from "mysql2/promise";
import { prompt } from "inquirer";
import Game from "./game";
import Player from "./player";
import Village from "./village";

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const mainMenu = () => {
    return prompt({
        type: "list",
        name: "choice",
        message: "Main Menu",
        choices: ["Choose player", "Create player", "Exit"]
    });
};

const choosePlayer = () => {
    return prompt([{
        type: "input",
        name: "name",
        message: "Please enter a player name:"
    }]);
};

const playerMenu = (name) => {
    return prompt({
        type: "list",
        name: "choice",
        message: `${name}'s menu`,
        choices: ["Pick a village", "Create a village", "Check score", "Pick another player"]
    });
};

const selectVillage = (name, villageNames) => {
    return prompt({
        type: "list",
        name: "villageName",
        message: `${name}'s villages`,
        choices: villageNames
    });
};

const nameVillage = (name) => {
    return prompt({
        type: "input",
        name: "villageName",
        message:`Enter a name for ${name}'s new village:`
    });
};


const villageMenu = (name) => {
    return prompt({
        type: "list",
        name: "choice",
        message: `The village of ${name}`,
        choices: [
            "View current status",
            "Construct a building",
            "Return to Player Menu"
        ]
    });
};

const buildingMenu = (buildings) => {
    return prompt({
        type: "list",
        name: "choice",
        message: "Choose a building to construct",
        choices: buildings
    });
};

const mainLoop = async (game: Game) => {
    let selection;
    do {
        selection = await mainMenu();
        if (selection.choice === "Choose player") {
            const { name } = await choosePlayer();
            if (game.checkPlayerName(name)) {
                const player = game.getPlayer(name);
                await playerLoop(name, player);
            } else {
                console.log(`! Player '${name}' does not exist!`);
            }
        } else if (selection.choice === "Create player") {
            const { name } = await choosePlayer();
            if (game.checkPlayerName(name)) {
                console.log(`! Player '${name}' already exists!`);
            } else {
                await game.createPlayer(name);
                console.log(`! Player '${name}' has been created!`);
            }
        }
    } while (selection.choice !== "Exit");
};

const playerLoop = async (name: string, player: Player) => {
    let selection;
    do {
        selection = await playerMenu(name);
        if (selection.choice === "Pick a village") {
            const villages = player.getVillageNames();
            if (villages.length === 0) {
                console.log(`! ${name} does not own any villages!`);
            } else {
                const { villageName } = await selectVillage(name, villages);
                const village = player.getVillage(villageName);
                await villageLoop(villageName, village);
            }
        } else if (selection.choice === "Create a village") {
            const { villageName } = await nameVillage(name);
            await player.createVillage(villageName);
            console.log(`! The village of ${villageName} was successfully constructed!`);
        } else if (selection.choice === "Check score") {
            const score = await player.getScore();
            console.log(`! ${name}'s current score is ${score}!`);
        }
    } while (selection.choice !== "Pick another player");
};

const villageLoop = async (name: string, village: Village) => {
    let selection;
    do {
        selection = await villageMenu(name);
        if (selection.choice === "View current status") {
            const status = await village.statusReport();
            console.log(status);
        } else if (selection.choice === "Construct a building") {
            const buildings = await village.getBuildings();
            const { choice } = await buildingMenu(buildings);
            const costResult = await village.checkCost(choice.type, choice.level);
            if (costResult.status !== "good") {
                console.log(`! You need at least ${costResult.cost} ${costResult.status}!`);
            } else {
                await village.enqueueBuilding(choice.type, choice.level);
                console.log("! Build order sucessfully enqueued!");
            }
        }
    } while (selection.choice !== "Return to Player Menu");
};

(async () => {
    try {
        const game = await Game.create();
        await mainLoop(game);
        await game.close();
    } catch (e) {
        console.log(e);
    }
})();
