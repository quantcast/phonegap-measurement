/*
 * Copyright 2015 Quantcast Corp.
 *
 * This software is licensed under the Quantcast Mobile App Measurement Terms of Service
 * https://www.quantcast.com/learning-center/quantcast-terms/mobile-app-measurement-tos
 * (the “License”). You may not use this file unless (1) you sign up for an account at
 * https://www.quantcast.com and click your agreement to the License and (2) are in
 * compliance with the License. See the License for the specific language governing
 * permissions and limitations under the License.
 

 *  These methods should only be used by app networks, most notably app platforms, app development shops, and companies with a large number of branded apps
 *  where they want to maintain the app's brand when quantifying but still have the app traffic attributed to a parent network. Entities quantifying
 *  a single app or a number of apps under the same network should not use this class. If what is described as a "network integration"
 *  doesn't make sense to you, it is likely that you should not use the Network integration.
 *
 *   The Networks extension adds the ability to identify a parent network, referred to as an "attributed network", for each app in addition to or instead of
 *   the app's API Key. However, only apps with an API Key will get a full profile on Quantcast.com. Apps without an API Key or an API Key from a different network
 *   will (additionally) have their activity attributed to the attributed (parent) network as "syndicated app traffic", contributing to the parent network's
 *   overall network traffic and demographics. Furthermore, the Networks extension allows the assignment of app-specific and network-specifc labels.
 *   App-specific labels will be used to create audience segments under the network of the API Key of the app. Network labels will be used to create audience
 *   segments under the attributed network of the app. If the API Key's network and the attributed network are the same, then app labels and network labels
 *   will both create audience segments under that network.
 */

var _setupLabels;
var _netLabels;

/// QuantcastNetworkMeasurement for PhoneGap requires PhoneGap version 2.1 and greater
var QuantcastNetworkMeasurement = {

    
    /**
     Start a Quantcast Measurement session and automatically sets up pause/resume/end events.  Nothing in the Quantcast Measurement API will work until this method is called. Must be called first, preferably right after the 'deviceready' event.
     @param {String} apiKey   Quantcast API key that activity for this app should be reported under. Obtain this key from the Quantcast website.
     @param {String} userIdentifier    A user identifier string that uniquely identifies the user and is meaningful to the app publisher, usually a user login name. This is not to be confused with a device identifier. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all. @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be associated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     */
    setUpQuantcastMeasurement: function (apiKey, networkCode, userIdentifier, applabels, netlabels, appIsDirectedAtChildren ) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks
        
        _setupLabels = applabels;
        _netLabels = netlabels;
        //set up pause resume events
        document.addEventListener('pause', QuantcastNetworkMeasurement.onPause, false);
        document.addEventListener('resume', QuantcastNetworkMeasurement.onResume, false);
        
        return cordovaRef.exec( null, null,
                               'QuantcastMeasurementPlugin',
                               'beginMeasurementSession',
                               [apiKey, networkCode, userIdentifier, applabels, netlabels, appIsDirectedAtChildren]);
    },
    
    onPause: function() {
        QuantcastNetworkMeasurement.pauseMeasurementSession(_setupLabels, _netLabels);
    },
        
    onResume: function() {
        QuantcastNetworkMeasurement.resumeMeasurementSession(_setupLabels, _netLabels);
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
      This feature is only useful if you implement a similar (hashed) user identifier recording with Quantcast Measurement on other platforms, such as the web. This method only needs to be called once per session, preferably immediately after the session has begun, or when the user identifier has changed (e.g., the user logged out and a new user logged in). Quantcast will use a one-way hash to encode the user identifier and record the results of that one-way hash, not what is passed here. The method will return the results of that one-way hash for your reference. You do not need to take any action on the results.
      This should only be used for network integrations.
     @param {callback} hashCallback   A callback function that will return the hashed version of the user identifier passed on to Quantcast. You do not need to take any action with this. It is only returned for your reference. nil will be returned if the user has opted out or an error occurs.
     @param {String} userIdentifier    A user identifier string that uniquely identifies the user and is meaningful to the app publisher, usually a user login name. This is not to be confused with a device identifier. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all. @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} appLabels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be associated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} networkLabels Labels that are seen by the network instead of the apiKey.
     */
    recordUserIdentifier: function (hashCallback, userIdentifier, appLabels, networkLabels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( hashCallback, null,
                               "QuantcastMeasurementPlugin",
                               "recordNetworkUserIdentifier",
                               [userIdentifier, appLabels, networkLabels]);
    },

    /**
     This is the primarily means for logging events on the network's profile with Quantcast Measurement. What gets logged in this method is completely up to the app developer.
      This should only be used for network integrations.
     @param {String} eventname A string that identifies the event being logged. Hierarchical information can be indicated by using a left-to-right notation with a period as a seperator. For example, logging one event named "button.left" and another named "button.right" will create three reportable items in Quantcast App Measurement: "button.left", "button.right", and "button". There is no limit on the cardinality that this hierarchal scheme can create, though low-frequency events may not have an audience report on due to the lack of a statistically significant population.
     @param {String or Array} networkLabels Labels that are seen by the network instead of the apiKey.
     */
    logNetworkEvent: function (eventname, networkLabels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "logNetworkEvent",
                               [eventname, networkLabels]);
    },

    /**
     By default, opt out is off (false). If you wish for Quantcast to stop collecting all measurement data for this device, you should enable (set to true) this property shortly after starting a measurement session. In order to protect user privacy, Quantcast will not log locations any more granular than "city", and will not log device location while your app is in the background. NOTE - Geolocation measurment is only supported on iOS 5 or later. Attempting to set this property to true on a device running iOS 4.x will have no affect. You do not have to set this property to false in order to pause geo-location tracking when the app goes into the background, as this is done automatically by the API.
      @param {boolean} optOut true if the user should be opted out
     */
    setOptOut: function (optOut) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "setOptOut",
                               [optOut]);
    },
    
    /**
     Will display a model dialog that provides the user with information on Quantcast Measurement and allows them to adjust their Quantcast App Measurement privacy settings for their device.
     @param {callback} optOutCallback   An optional object that returns whether the opt out status has changed.
     */
    displayUserPrivacyDialog: function (optOutCallback){
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova;

        return cordovaRef.exec( optOutCallback, null,
                               "QuantcastMeasurementPlugin",
                               "displayUserPrivacyDialog",
                               []);
        
    },

    /**
     Enabling logging provides you the developer some insight into what is happening in the Quantcast Measurement SDK. You should not release your app with debugging turned on, as it is fairly verbose.
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
    },

    /**
       Start a Quantcast Measurement session for Networks. This case is only used Nothing in the Quantcast Measurement API will work until this method is called. Must be called first, preferably right after the 'deviceready' event.
       This should only be used for network integrations.
     @param {callback} hashCallback   A callback function that will return the hashed version of the user identifier passed on to Quantcast. You do not need to take any action with this. It is only returned for your reference. null will be returned if the user has opted out or an error occurs.
     @param {String} apiKey   Quantcast API key that activity for this app should be reported under. Obtain this key from the Quantcast website.  If you are providing a network code, this can be null.
     @param {String} networkCode   The network code where this traffic should also be attributed.  Obtain this key from the Quantcast website.  If there is no networkCode given then and apiKey is required, but please consider using setUpQuantcastMeasurement instead.
     @param {String} userIdentifier    A user identifier string that uniquely identifies the user and is meaningful to the app publisher, usually a user login name. This is not to be confused with a device identifier. There is no requirement on format of this other than that it is a meaningful user identifier to you. Quantcast will immediately one-way hash this value, thus not recording it in its raw form. You should pass nil to indicate that there is no user identifier available, either at the start of the session or at all. @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be ascociated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} appLabels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be associated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} networkLabels Labels that are seen by the network instead of the apiKey.
     @param {Boolean} appIsDirectedAtChildren Whether or not this app is known to be specifically targeted for children 13 and under.  In compliance with COPPA and other international laws, if an app is directly targeted at children 13 and under certain measures must be taken to stop tracking of this audience.
     */
    beginNetworkMeasurementSession: function (hashCallback, apiKey, networkCode, userIdentifier, appLabels, networkLabels, appIsDirectedAtChildren ) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

        return cordovaRef.exec( hashCallback, null,
                               "QuantcastMeasurementPlugin",
                               "beginNetworkMeasurementSession",
                               [apiKey, networkCode, userIdentifier, appLabels, networkLabels, appIsDirectedAtChildren]);
    },

    /**
     Temporarily suspends the operations of the Quantcast Measurement API. Ideally, this method is called after receiving the 'pause' event.
     This should only be used for network integrations.
     @param {String or Array} labels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be associated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} networkLabels Labels that are seen by the network instead of the apiKey.
     */
    pauseNetworkMeasurementSession: function (appLabels, networkLabels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 
        
        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "pauseNetworkMeasurementSession",
                               [appLabels, networkLabels]);
    },

    /**
     Resumes the operations of the Quantcast Measurement API after it was suspended. Ideally, this method is called after receiving the 'resume' event.
     This should only be used for network integrations.
     @param {String or Array} appLabels   Object containing one or more String objects, each of which are a distinct label to be applied to this event. A label is any arbitrary string that you want to be associated with this event, and will create a second dimension in Quantcast Measurement reporting. Nominally, this is a "user class" indicator. For example, you might use one of two labels in your app: one for user who ave not purchased an app upgrade, and one for users who have purchased an upgrade.
     @param {String or Array} networkLabels Labels that are seen by the network instead of the apiKey.
     */
    resumeNetworkMeasurementSession: function (appLabels, networkLabels) {
        var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; 

        return cordovaRef.exec( null, null,
                               "QuantcastMeasurementPlugin",
                               "resumeNetworkMeasurementSession",
                               [appLabels, networkLabels]);
    }

}
module.exports = QuantcastMeasurement;
