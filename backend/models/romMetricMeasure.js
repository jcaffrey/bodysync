/**
 * Created by hsadev2 on 2/18/17.
 */

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
        dayCompleted: {
            type:DataTypes.DATEONLY
        }
    }, {
        classMethods: {
            associate: function(models) {
                romMetricMeasure.belongsTo(models.romMetric, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return romMetricMeasure;
};
