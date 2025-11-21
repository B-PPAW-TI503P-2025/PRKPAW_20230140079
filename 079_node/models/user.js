'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Presensi, {
        foreignKey: 'userId',
        as: 'presensi'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING 
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};