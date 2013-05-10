/*
 * Copyright 2013 Quantcast Corp.
 *
 * This software is licensed under the Quantcast Mobile App Measurement Terms of Service
 * https://www.quantcast.com/learning-center/quantcast-terms/mobile-app-measurement-tos
 * (the “License”). You may not use this file unless (1) you sign up for an account at
 * https://www.quantcast.com and click your agreement to the License and (2) are in
 * compliance with the License. See the License for the specific language governing
 * permissions and limitations under the License.
 *
 */

var _setupLabels;

/// QuantcastMeasurement for PhoneGap requires PhoneGap version 2.1 and greater
var QuantcastMeasurement = {

    
    /**
     Start a Quantcast Measurement session and automatically sets up pause/resume/end events.  Nothing in the Quantcast Measurement API will work until this method is called. Must be called first, preferably right after the 'deviceready' event.
     @param {String} apiKey   Quantcast API key that activity for this app should be reported under. Obtain this key from the Quantcast website.
     @param {String} userIdentifier    A user identifier string that is meanigful to the app publisher. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    setUpQuantcastMeasurement: function (apiKey, userIdentifier, labels ) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks
        
        _setupLabels = labels;
        //set up pause resume events
        document.addEventListener('pause', QuantcastMeasurement.onPause, false);
        document.addEventListener('resume', QuantcastMeasurement.onResume, false);
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "beginMeasurementSession",
                               [apiKey, userIdentifier, labels]);
    },
    
    onPause: function() {
        QuantcastMeasurement.pauseMeasurementSession(_setupLabels);
    },
        
    onResume: function() {
        QuantcastMeasurement.resumeMeasurementSession(_setupLabels);
    },
    
    
    /**
       Start a Quantcast Measurement session. Nothing in the Quantcast Measurement API will work until this method is called. Must be called first, preferably right after the 'deviceready' event.
     @param {callback} hashCallback   A callback function that will return the hashed version of the user identifier passed on to Quantcast. You do not need to take any action with this. It is only returned for your reference. null will be returned if the user has opted out or an error occurs.
     @param {String} apiKey   Quantcast API key that activity for this app should be reported under. Obtain this key from the Quantcast website.
     @param {String} userIdentifier    A user identifier string that is meanigful to the app publisher. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    beginMeasurementSession: function (hashCallback, apiKey, userIdentifier, labels ) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

        return cordovaRef.exec( hashCallback, null,
                               "QuantcastMeasurementPlugin",
                               "beginMeasurementSession",
                               [apiKey, userIdentifier, labels]);
    },
    
    /**
     Temporarily suspends the operations of the Quantcast Measurement API. Ideally, this method is called after receiving the 'pause' event.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    pauseMeasurementSession: function (labels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "pauseMeasurementSession",
                               [labels]);
    },
    
    /**
     Resumes the operations of the Quantcast Measurement API after it was suspended. Ideally, this method is called after receiving the 'resume' event.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    resumeMeasurementSession: function (labels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 

        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "resumeMeasurementSession",
                               [labels]);
    },
    
    /**
      This feature is only useful if you implement a similar (hashed) user identifier recording with Quantcast Measurement on other platforms, such as the web. This method only needs to be called once per session, preferably immediately after the session has begun, or when the user identifier has changed (e.g., the user logged out and a new user logged in). Quantcast will use a one-way hash to encode the user identifier and record the results of that one-way hash, not what is passed here. The method will return the results of that one-way hash for your reference. You do not need to take any action on the results.
     @param {callback} hashCallback   A callback function that will return the hashed version of the user identifier passed on to Quantcast. You do not need to take any action with this. It is only returned for your reference. nil will be returned if the user has opted out or an error occurs.
     @param {String} userIdentifier    A user identifier string that is meanigful to the app publisher. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    recordUserIdentifier: function (hashCallback, userIdentifier, labels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( hashCallback, null,
                               "QuantcastMeasurementPlugin",
                               "recordUserIdentifier",
                               [userIdentifier, labels]);
    },
    
    /**
     This is the primarily means for logging events with Quantcast Measurement. What gets logged in this method is completely up to the app developper.
     @param {String} eventname A string that identifies the event being logged. Hierarchical information can be indicated by using a left-to-right notation with a period as a seperator. For example, logging one event named "button.left" and another named "button.right" will create three reportable items in Quantcast App Measurement: "button.left", "button.right", and "button". There is no limit on the cardinality that this hierarchal scheme can create, though low-frequency events may not have an audience report on due to the lack of a statistically significant population.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    logEvent: function (eventname, labels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "logEvent",
                               [eventname, labels]);
    },
    
    /**
     By default, geo-location logging is off (false). If you wish for Quantcast to provide measurement services pertaining to the user's geo-location, you should enable (set to true) this property shortly after starting a measurement session. In order to protect user privacy, Quantcast will not log locations any more granular than "city", and will not log device location while your app is in the background. NOTE - Geolocation measurment is only supported on iOS 5 or later. Attempting to set this property to true on a device running iOS 4.x will have no affect. You do not have to set this property to false in order to pause geo-location tracking when the app goes into the background, as this is done automatically by the API.
      @param {boolean} geolocate true if events should send geolocation data
     */
    setGeoLocation: function (geolocate) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "setGeolocation",
                               [geolocate]);
    },
    
    /**
     Will display a model dialog that provides the user with information on Quantcast Measurement and allows them to adjust their Quantcast App Measurement privacy settings for their device.
     @param {callback} optOutCallback   An optional object that returns wheather the opt out status has changed.
     */
    displayUserPrivacyDialog: function (optOutCallback){
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

        return cordovaRef.exec( optOutCallback, null,
                               "QuantcastMeasurementPlugin",
                               "displayUserPrivacyDialog",
                               []);
        
    },

    /**
     Enabling logging provides you the developper some insight into what is happening in the Quantcast Measurement SDK. You should not release your app with debugging turned on, as it is fairly verbose.
     @param {boolean} logging   true if logging should be turned on
     */
    setDebugLogging: function (logging) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "setDebugLogging",
                               [logging]);
    },
    
    /**
     This is the integer number of events the SDK will collect before initiating an upload to the Quantcast servers. Uploads that occur too often will drain the device's battery. Uploads that don't occur often enough will cause significant delays in uploading data to the Quantcast server for analysis and reporting. You may set this property to an integer value greater than or equal to 1. This value defaults to 100 if it is unset by you.
     @param {int} eventCount   number of events to collect before uploading
     */
    uploadEventCount: function (eventCount) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 

        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "uploadEventCount",
                               [eventCount]);
    }
    
    
};
