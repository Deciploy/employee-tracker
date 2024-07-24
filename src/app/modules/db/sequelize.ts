import sqlite3 from "sqlite3";
import { Sequelize } from "sequelize";

const NAME = process.env.LOCAL_DB_NAME;
const USERNAME = process.env.LOCAL_DB_USERNAME;
const PASSWORD = process.env.LOCAL_DB_PASSWORD;

export const sequelize = new Sequelize(
    NAME,
    USERNAME,
    PASSWORD,
    {
        dialect: "sqlite",
        dialectModule: sqlite3,
        logging: false,
    }
);