const { env } = process;


const options = {
    type: 'mysql',
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    username: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    entities: ['./dist/*/entities/*{.ts,.js}', './src/*/entities/*{.ts,.js}'],
    synchronize: true,
    migrations: ['./dist/*/entities/migrations/*{.ts,.js}', './src/*/entities/migrations/*{.ts,.js}'],
    logging: true,
    connectTimeout: 30000,
    cli: { migrationsDir: 'migrations' },
};

module.exports = options;
