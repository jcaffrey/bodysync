/**
 * Created by hsadev2 on 2/18/17.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Exercise = sequelize.define("Exercise", {
        // schema
        name: {type: DataTypes.STRING, allowNull: false},
        numRepsOrDuration: {type: DataTypes.INTEGER, allowNull: false},
        numSets: {type: DataTypes.INTEGER, allowNull: false},
        assignedFrequency: {type: DataTypes.INTEGER, allowNull: false},
        ptNotes: {type: DataTypes.TEXT},
        mediaUrl: {type: DataTypes. STRING}
    }, {
        classMethods: {
            associate: function(models) {
                Exercise.belongsTo(models.exerciseSet, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                Exercise.hasMany(models.exerciseCompletion);
            }
        }
    });

    return Exercise;
};
