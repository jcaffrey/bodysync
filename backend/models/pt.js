// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

module.exports = function(sequelize, DataTypes) {
    var PT = sequelize.define("PT", {
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
          //proPicUrl: { type: DataTypes.STRING, defaultValue: stockImage.url}
        phoneProvider: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        classMethods: {
            associate: function(models) {
                PT.hasMany(models.Patient);
                PT.hasMany(models.exerciseSet);
            }
        }
    });
   
    return PT;
};
