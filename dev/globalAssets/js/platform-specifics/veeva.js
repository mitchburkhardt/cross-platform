app.nav.loadParent = function(url, direction) {
    // TODO: load parent function for MI touch
};
app.nav.SaveObject = function(clmDescription, clmAnswer, clmCallback) {
    var url = window.location.pathname,
        filename = url.substring(url.lastIndexOf('/') + 1),
        clmTrackingID = filename.replace(".html", "");
    var myCallClickStream = {};
    myCallClickStream.Track_Element_Id_vod__c = clmTrackingID;
    myCallClickStream.Track_Element_Type_vod__c = clmDescription;
    myCallClickStream.Selected_Items_vod__c = clmAnswer;
    myCallClickStream.Track_Element_Description_vod__c = clmAnswer;
    // var myJSONText = JSON.stringify( myCallClickStream );
    com.veeva.clm.createRecord(Call_Clickstream_vod__c, myCallClickStream, clmCallback);
};
app.nav.trackChild = function(GUID, type) {
    // TODO: track child function for Veeva touch
};
