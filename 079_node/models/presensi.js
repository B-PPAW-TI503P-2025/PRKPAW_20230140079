'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      // Relasi ke User
      Presensi.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'userData'
      });
    }
  }

  Presensi.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      waktu: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Presensi',
      tableName: 'Presensis' // pastikan sesuai database
    }
  );

  return Presensi;
};
