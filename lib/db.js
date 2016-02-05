//Load modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./community.sql');

var communityAreaTable = "CommunityArea";
var communityDataTable = "CommunityData";

function getAllCommunityIDs(callback) {
    db.all("SELECT communityID from "+communityAreaTable,function(err,rows){
        var communityIDs = [];
        for (var i = 0; i < rows.length; ++i) {
            communityIDs.push(rows[i].communityID);
        }
        callback(err,communityIDs)
    });
}

function getCommunityInfo(communityID,callback) {
    db.all("SELECT * from "+communityAreaTable+" where communityID="+communityID,function(err,rows){
        callback(err,rows[0]);
    });
}

function getAllCommunitiesInfo(callback) {
    db.all("SELECT * from "+communityAreaTable,function(err,rows) {
        callback(err,rows);
    });
}

function insertCommunityData(communityID,fields) {
    var insertStmt = "INSERT OR REPLACE INTO "+communityDataTable+" VALUES ("+communityID+",";
    if (fields.crimePctOfAvg && !isNaN(fields.crimePctOfAvg)) {
        insertStmt += fields.crimePctOfAvg;
    }
    insertStmt += ",";
    if (fields.nightlifePctOfAvg && !isNaN(fields.nightlifePctOfAvg)) {
        insertStmt += fields.nightlifePctOfAvg;
    }
    insertStmt += ",";
    if (fields.crowdedPctOfAvg && !isNaN(fields.crowdedPctOfAvg)) {
        insertStmt += fields.crowdedPctOfAvg;
    }
    insertStmt += ")";
    db.run(insertStmt);
}

module.exports = {
    getAllCommunityIDs: getAllCommunityIDs,
    getCommunityInfo: getCommunityInfo,
    getAllCommunitiesInfo: getAllCommunitiesInfo,
    insertCommunityData: insertCommunityData
};