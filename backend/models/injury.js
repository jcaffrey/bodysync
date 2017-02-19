/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Injury = sequelize.define("Injury", {
        // schema
        name: {type: DataTypes.STRING, allowNull: false},
    }, {
        classMethods: {
            associate: function(models) {
                Injury.belongsTo(models.Patient, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                Injury.hasMany(models.romMetric);
                Injury.hasMany(models.exerciseSet, {
                    allowNull: false
                   // defaultValue: null   // injuryId within ExerciseSet initialized to null
                });
            }
        }
    });

    return Injury;
};
