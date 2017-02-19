/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var exerciseSet = sequelize.define("exerciseSet", {
        // schema
        name: {type: DataTypes.STRING, allowNull: false},
        isTemplate: {type: DataTypes.BOOLEAN, allowNull: false},
        intendedInjuryType: {type: DataTypes.STRING, allowNull: false}
    }, {
        classMethods: {
            associate: function(models) {
                exerciseSet.belongsTo(models.Injury, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false  // if not null, exercise set has been assigned
                       // defaultValue: null
                    }
                });
                exerciseSet.belongsTo(models.PT, {
                    foreignKey: {
                        allowNull: false      // exercise set should always belong to a PT
                    }
                });
                exerciseSet.hasMany(models.Exercise);
            }
        }
    });

    return exerciseSet;
};
