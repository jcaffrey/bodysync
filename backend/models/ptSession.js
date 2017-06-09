"use strict";

module.exports = function(sequelize, DataTypes) {
    var ptSession = sequelize.define("ptSession", {
        ptId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sessionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER  // TODO: look up how to subtract dates
        },
        // resourceRequested: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });

        // name: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // },
        // numRepsOrDuration: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // numSets: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // assignedFrequency: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // assignedDuration: {
        //     type: DataTypes.INTEGER
        // },
        // dateAssigned: {
        //     type: DataTypes.DATEONLY,
        //     //allowNull: false
        // },
        // ptNotes: {
        //     type: DataTypes.TEXT
        // },
        // mediaUrl: {
        //     type: DataTypes. STRING
        // }
    return ptSession;
};
