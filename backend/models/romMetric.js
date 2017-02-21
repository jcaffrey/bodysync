/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var romMetric = sequelize.define("romMetric", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        classMethods: {
            associate: function(models) {
                romMetric.belongsTo(models.Injury, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                romMetric.hasMany(models.romMetricMeasure);
            }
        }
    });

    return romMetric;
};
