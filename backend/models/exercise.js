

"use strict";

module.exports = function(sequelize, DataTypes) {
    var exercise = sequelize.define("exercise", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numRepsOrDuration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        numSets: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        assignedFrequency: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dateAssigned: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        ptNotes: {
            type: DataTypes.TEXT
        },
        mediaUrl: {
            type: DataTypes. STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                exercise.belongsTo(models.exerciseSet, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                exercise.hasMany(models.exerciseCompletion);
            }
        }
    });

    return exercise;
};
