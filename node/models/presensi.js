module.exports = (sequelize, DataTypes) => {
  const Presensi = sequelize.define(
    "Presensi",
    {
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      checkIn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      checkOut: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Presensis",
    }
  );

  return Presensi;
};
