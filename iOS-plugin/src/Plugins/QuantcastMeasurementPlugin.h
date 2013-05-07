//
//  QuantcastMeasurementPlugin.h
//  PhoneGapMeasurement
//
//  Created by Kevin Smith on 4/9/13.
//
//

#import <Cordova/CDV.h>

@interface QuantcastMeasurementPlugin : CDVPlugin

- (void)beginMeasurementSession:(CDVInvokedUrlCommand*)command;
- (void)endMeasurementSession:(CDVInvokedUrlCommand*)command;
- (void)pauseMeasurementSession:(CDVInvokedUrlCommand*)command;
- (void)resumeMeasurementSession:(CDVInvokedUrlCommand*)command;
- (void)logEvent:(CDVInvokedUrlCommand*)command;
- (void)recordUserIdentifier:(CDVInvokedUrlCommand*)command;
- (void)setGeolocation:(CDVInvokedUrlCommand*)command;
- (void)displayUserPrivacyDialog:(CDVInvokedUrlCommand*)command;
- (void)setDebugLogging:(CDVInvokedUrlCommand*)command;
- (void)uploadEventCount:(CDVInvokedUrlCommand*)command;

@end
