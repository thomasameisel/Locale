//Load modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./community.sql');

var communityAreaTable = "CommunityArea";
var communityDataTable = "CommunityData";

function getCommunityInfo(communityID,callback) {
    db.all("SELECT * from "+communityAreaTable+" where communityID="+communityID,function(err,rows){
        callback(err,rows[0])
    });
}

function getAllCommunitiesInfo(callback) {
    db.all("SELECT * from "+communityAreaTable,function(err,rows) {
        callback(err,rows);
    });
}

/*
fields must be in order
crimePctOfAvg,nightlifePctOfAvg,crowdedPctOfAvg
 */
function insertCommunityData(communityID,fields) {
    var insertStmt = "INSERT INTO "+communityDataTable+" VALUES ("+communityID+",";
    for (var i = 0; i < fields.length; ++i) {
        insertStmt+=fields[i];
        if(i<(fields.length-1)) {
            insertStmt+=",";
        } else {
            insertStmt+=")";
        }
    }
    db.run(insertStmt);
}

module.exports = {
    getCommunityInfo: getCommunityInfo,
    getAllCommunitiesInfo: getAllCommunitiesInfo,
    insertCommunityData: insertCommunityData
};