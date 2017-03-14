/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var exerciseCompletion = sequelize.define("exerciseCompletion", {
        // schema

        dateCompleted: {
            type: DataTypes.DATEONLY,
            allowNull: false
        } // date without time
    }, {
        classMethods: {
            associate: function(models) {
                exerciseCompletion.belongsTo(models.exercise, {
                    onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });

    return exerciseCompletion;
};
