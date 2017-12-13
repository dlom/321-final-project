import * as fs from "fs-extra";
import * as path from "path";

import { RowDataPacket } from "mysql2/promise";

const dir = "../sql";
const fileCache: string[] = [];
const statementCache: { [name: string]: string } = {};

const findRow = (rows: RowDataPacket[], prop, value) => {
    return rows.find(row => {
        return row[prop] === value;
    });
}

const loadStatement = async (name: string) => {
    if (fileCache.length === 0) {
        fileCache.push(...await fs.readdir(path.join(__dirname, dir)));
    }
    if (!statementCache.hasOwnProperty(name)) {
        const fullPath = path.join(__dirname, dir, `${name}.sql`);
        const statement = await fs.readFile(fullPath, "utf8");
        statementCache[name] = statement;
    }
    return statementCache[name];
}

export { loadStatement, findRow };
