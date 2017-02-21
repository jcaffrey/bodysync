// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Patient = sequelize.define("Patient", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING
        },
        token: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail : true
            }
        },
        //   proPicUrl: { type: DataTypes.STRING, defaultValue: stockImage.url}
        surgeryType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: DataTypes.INTEGER,
        weight: DataTypes.INTEGER,
        phoneProvider: DataTypes.STRING,
        surgeryNotes: DataTypes.TEXT,
        ptNotes: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                Patient.belongsTo(models.PT, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                Patient.hasMany(models.Injury);
            }
        }
    });
   
    return Patient;
};
