
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
            type: DataTypes.DATEONLY
        },
        dayMeasured: {
            type:DataTypes.DATEONLY,
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
