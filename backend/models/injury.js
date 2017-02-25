/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var injury = sequelize.define("injury", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                injury.belongsTo(models.patient, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                injury.hasMany(models.romMetric);
                injury.hasMany(models.exerciseSet, {
                    allowNull: false
                   // defaultValue: null   // injuryId within ExerciseSet initialized to null
                });
            }
        }
    });

    return injury;
};
