//Load modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./community.sql');

var communityAreaTable = "CommunityArea";

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

module.exports = {
    getCommunityInfo: getCommunityInfo,
    getAllCommunitiesInfo: getAllCommunitiesInfo
};