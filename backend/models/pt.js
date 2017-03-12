// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

module.exports = function(sequelize, DataTypes) {
    var pt = sequelize.define("pt", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
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
        token: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
          //proPicUrl: { type: DataTypes.STRING, defaultValue: stockImage.url}
        phoneProvider: {
            type: DataTypes.STRING
        },
        // temp
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        classMethods: {
            associate: function(models) {
                pt.hasMany(models.patient);
               // PT.hasMany(models.exerciseSet);
            }
        }
    });
   
    return pt;
};
