import { Connection, createConnection } from "mysql2/promise";
import Player from "./player";
import { loadStatement } from "./util";

export default class Game {
    private connection: Connection;
    private players: Player[];

    static async create() {
        const g = new Game();
        await g.setup();
        return g;
    }

    private constructor() {
        this.players = [];
    }

    private async setup() {
        this.connection = await createConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            multipleStatements: true
        });
        const initialize = await loadStatement("initialize");
        await this.connection.query(initialize);

        // Uncomment on first run
        // const settings = await loadStatement("settings");
        // await this.connection.query(settings);

        await this.loadPlayers();
    }

    public async close() {
        await this.connection.end();
    }

    private async loadPlayers() {
        const load = await loadStatement("loadPlayers");
        const [results] = await this.connection.execute<any[]>(load);
        this.players = await Promise.all(results.map(async row => {
            const player = new Player(row.player_id, row.name, this.connection);
            await player.loadVillages();
            return player;
        }));
    }

    public async createPlayer(name: string) {
        const create = await loadStatement("createPlayer");

        const [result] = await this.connection.execute<any>(create, [name]);

        const player = new Player(result.insertId, name, this.connection);
        this.players.push(player);
    }

    public checkPlayerName(name: string) {
        return this.players.map(player => {
            return player.name;
        }).indexOf(name) >= 0;
    }

    public getPlayer(name: string) {
        return this.players.find(player => {
            return player.name === name;
        });
    }
};
