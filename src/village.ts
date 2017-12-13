import { Connection } from "mysql2/promise";
import { loadStatement, findRow } from "./util";
import { relativeTime } from "humanize";

const shortnameMap = {
    wood: "Lumber Camp",
    iron: "Iron Mine",
    hq: "Magistrate",
    win: "Monument"
};

export default class Village {
    constructor(private id: number,
                public name: string,
                public x: number,
                public y: number,
                private connection: Connection) {

    }

    private async getResourceLevels() {
        const resourceCounts = await loadStatement("resourceCounts");
        const [results] = await this.connection.execute<any[]>(resourceCounts, [this.id, this.id, this.id, this.id]);
        const iron = parseInt(findRow(results, "type", "iron").total, 10);
        const wood = parseInt(findRow(results, "type", "wood").total, 10);
        return { iron, wood };
    }

    private async getMaxLevel(type: string) {
        const getMaximumPossibleLevels = await loadStatement("getMaximumPossibleLevels");
        const [result] = await this.connection.execute<any[]>(getMaximumPossibleLevels, [type]);
        return parseInt(result[0].max, 10);
    }

    public async checkCost(type: string, level: number) {
        const getCost = await loadStatement("getCost");
        const [result] = await this.connection.execute<any[]>(getCost, [this.id, type, level]);
        const cost = Math.abs(parseInt(result[0].cost, 10));
        const time = parseInt(result[0].time, 10);
        const { iron, wood } = await this.getResourceLevels();
        let status;
        if (iron < cost) {
            status = "iron";
        } else if (wood < cost) {
            status = "wood";
        } else {
            status = "good";
        }
        return { status, cost, time };
    }

    private async getBuildingLevels() {
        const buildingLevels = await loadStatement("buildingLevels");
        const [results] = await this.connection.execute<any[]>(buildingLevels, [this.id]);
        const out = {};
        results.forEach(row => {
            out[row.type] = parseInt(row.building_level, 10);
        });
        return out;
    }

    private async calculateCompletionTime(type: string, level: number) {
        const costResult = await this.checkCost(type, level);
        return (Math.ceil(Date.now() / 1000)) + costResult.time;
    }

    public async getBuildings() {
        const buildingLevels = await this.getBuildingLevels();
        const buildings = await Promise.all(Object.keys(buildingLevels).map(async type => {
            const level = buildingLevels[type];
            const isMaxLevel = (level === await this.getMaxLevel(type));
            const levelString = (isMaxLevel ? `${level}` : `${level} -> ${level + 1}`);
            const costString = (isMaxLevel ? "" : ` ${relativeTime(await this.calculateCompletionTime(type, level + 1))}`);
            return {
                name: `${shortnameMap[type]} (${levelString})${costString}`,
                value: { type, level: level + 1 },
                disabled: (isMaxLevel ? "Already max level!" : false)
            }
        }));
        return buildings;
    }

    public async statusReport() {
        const { iron, wood } = await this.getResourceLevels();
        const statusLine = `Coordinates: (${this.x}, ${this.y})`;
        const resources = `Iron: ${iron}, Wood: ${wood}`;
        const buildingLevels = await this.getBuildingLevels();
        const buildings = Object.keys(buildingLevels).map(type => {
            return `   ${shortnameMap[type]} (${buildingLevels[type]})`;
        }).join("\n");

        return [statusLine, resources, "---", "Buildings: ", buildings].join("\n");
    }

    public async enqueueBuilding(type: string, level: number) {
        const { time } = await this.checkCost(type, level);
        const buildingLevels = await loadStatement("enqueueBuilding");
        await this.connection.execute<any[]>(buildingLevels, [this.id, time, type, level]);
    }
};
