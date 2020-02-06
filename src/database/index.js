import Sequelize from 'sequelize';
import User from '../app/models/User'; // import dos Models
import databaseConfig from '../config/database';

const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // carrega o Model e faz a conexão com a BD
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
