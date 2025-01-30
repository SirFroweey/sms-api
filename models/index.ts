import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './kixie.db',
});

/** Let's refresh the db everytime we run the server for development purposes */
(async () => {
    await sequelize.sync({ force: true });
})();

export default sequelize;