import { Connection } from "mysql2/promise";
import Village from "./village";
import { loadStatement } from "./util";

const generateRandomCoords = () => {
    const x = Math.random();
    const y = Math.random();
    return { x, y };
};

export default class Player {
    private villages: Village[];

    constructor(private id: number, public name: string, private connection: Connection) {
        this.villages = [];
    }

    public async loadVillages() {
        const load = await loadStatement("loadVillages");
        const [results] = await this.connection.execute<any[]>(load, [this.id]);
        this.villages = await Promise.all(results.map(async row => {
            const village = new Village(row.village_id, row.name, row.x_coord, row.y_coord, this.connection);
            return village;
        }));
    }

    public getVillageNames() {
        return this.villages.map(village => {
            return village.name;
        });
    }

    public getVillage(name: string) {
        return this.villages.find(village => {
            return village.name === name;
        });
    }

    public async createVillage(name: string) {
        const create = await loadStatement("createVillage");
        const initialize = await loadStatement("initializeVillage");

        const [result] = await this.connection.execute<any>(create, [this.id, name]);

        const id = result.insertId;
        await this.connection.execute<any>(initialize, [id, id, id, id]);

        const { x, y } = generateRandomCoords();

        const village = new Village(id, name, x, y, this.connection);
        this.villages.push(village);
    }

    public async getScore() {
        const create = await loadStatement("getScore");
        const [result] = await this.connection.execute<any[]>(create, [this.id]);

        return result[0].score;
    }
};
