
"use strict";

module.exports = function(sequelize, DataTypes) {
    var romMetricMeasure = sequelize.define("romMetricMeasure", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        degreeValue: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nextGoal: {
            type: DataTypes.INTEGER
        },
        dayOfNextGoal: {
            type: DataTypes.DATEONLY  //  TODO set default value to 1 week from now
        },
        dayMeasured: {
            type:DataTypes.DATEONLY,  //  TODO set default value to now
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                romMetricMeasure.belongsTo(models.romMetric, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return romMetricMeasure;
};
