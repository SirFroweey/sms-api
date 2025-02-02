import { Sequelize } from 'sequelize-typescript';

let sequelize: Sequelize;

if(process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './kixie.db',
    logging: false
  });  
  /** Let's refresh the db everytime we run the server for local development */
  (async () => {
    await sequelize.sync({ force: true });
  })();
}

export default sequelize;