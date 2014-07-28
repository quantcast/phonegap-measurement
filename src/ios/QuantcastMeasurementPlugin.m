/*
 * © Copyright 2012-2014 Quantcast Corp.
 *
 * This software is licensed under the Quantcast Mobile App Measurement Terms of Service
 * https://www.quantcast.com/learning-center/quantcast-terms/mobile-app-measurement-tos
 * (the “License”). You may not use this file unless (1) you sign up for an account at
 * https://www.quantcast.com and click your agreement to the License and (2) are in
 * compliance with the License. See the License for the specific language governing
 * permissions and limitations under the License. Unauthorized use of this file constitutes
 * copyright infringement and violation of law.
 */

#ifndef __has_feature
#define __has_feature(x) 0
#endif
#ifndef __has_extension
#define __has_extension __has_feature // Compatibility with pre-3.0 compilers.
#endif

#if __has_feature(objc_arc) && __clang_major__ >= 3
#error "Quantcast Measurement is not designed to be used with ARC. Please add '-fno-objc-arc' to this file's compiler flags"
#endif // __has_feature(objc_arc)

#import "QuantcastMeasurementPlugin.h"
#import "QuantcastMeasurement.h"

NSString *const VersionLabel = @"_sdk.phonegap.ios.v113";

@interface QuantcastMeasurementPlugin ()<QuantcastOptOutDelegate>

@property (nonatomic, copy) NSString* optOutDisplayCallbackID; //we have to hold this for the delegate callback
@property (nonatomic, retain) id<NSObject> labels;

@end


@implementation QuantcastMeasurementPlugin

@synthesize optOutDisplayCallbackID=_optOutDisplayCallbackID, labels=_labels;

-(void)dealloc{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [_optOutDisplayCallbackID release];
    [_labels release];
    [super dealloc];
}


- (void)beginMeasurementSession:(CDVInvokedUrlCommand*)command{

    NSString *callbackId = command.callbackId;
    
    NSString* apiKey = [self argumentAsString:[command.arguments objectAtIndex:0]];
    NSString* userId = [self argumentAsString:[command.arguments objectAtIndex:1]];
    self.labels = [self argumentAsLabel:[command.arguments objectAtIndex:2] appendingItem:VersionLabel];
    
    //always setup terminate notifications since phonegap doesnt have one
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(terminateNotification) name:UIApplicationWillTerminateNotification object:nil];
    
    NSString* hash = [[QuantcastMeasurement sharedInstance] beginMeasurementSessionWithAPIKey:apiKey userIdentifier:userId labels:self.labels];
    
    if(callbackId){
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:hash];
        [self writeJavascript:[result toSuccessCallbackString:callbackId]];
    }
    
}

-(void)terminateNotification:(NSNotification*)notif{
    [[QuantcastMeasurement sharedInstance] endMeasurementSessionWithLabels:self.labels];
}

- (void)endMeasurementSession:(CDVInvokedUrlCommand*)command{
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:0]];
    [[QuantcastMeasurement sharedInstance] endMeasurementSessionWithLabels:labels];
}

- (void)pauseMeasurementSession:(CDVInvokedUrlCommand*)command{    
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:0]];
    [[QuantcastMeasurement sharedInstance] pauseSessionWithLabels:labels];
}

- (void)resumeMeasurementSession:(CDVInvokedUrlCommand*)command{
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:0] appendingItem:VersionLabel];
    [[QuantcastMeasurement sharedInstance] resumeSessionWithLabels:labels];
}

- (void)recordUserIdentifier:(CDVInvokedUrlCommand*)command{
    NSString *callbackId = command.callbackId;
    
    NSString* userId = [self argumentAsString:[command.arguments objectAtIndex:0]];
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:1]];
    
    NSString* hash = [[QuantcastMeasurement sharedInstance] recordUserIdentifier:userId withLabels:labels];
    
    if(callbackId){
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:hash];
        [self writeJavascript:[result toSuccessCallbackString:callbackId]];
    }
    
}

- (void)logEvent:(CDVInvokedUrlCommand*)command{
    NSString* event = [self argumentAsString:[command.arguments objectAtIndex:0]];
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:1]];
    
    [[QuantcastMeasurement sharedInstance] logEvent:event withLabels:labels];
}

- (void)setGeolocation:(CDVInvokedUrlCommand*)command{
    
    BOOL locateEnabled = [self argumentAsBool:[command.arguments objectAtIndex:0]];
    [QuantcastMeasurement sharedInstance].geoLocationEnabled = locateEnabled;
}

- (void)setOptOut:(CDVInvokedUrlCommand*)command{
    
    BOOL optedOut = [self argumentAsBool:[command.arguments objectAtIndex:0]];
    [QuantcastMeasurement sharedInstance].isOptedOut = optedOut;
}

- (void)displayUserPrivacyDialog:(CDVInvokedUrlCommand*)command{
    if(command.callbackId){
        self.optOutDisplayCallbackID = command.callbackId;
    }
    
    [[QuantcastMeasurement sharedInstance] displayUserPrivacyDialogOver:[UIApplication sharedApplication].keyWindow.rootViewController withDelegate:self];
    
}

- (void)setDebugLogging:(CDVInvokedUrlCommand*)command{
    BOOL debugEnabled = [self argumentAsBool:[command.arguments objectAtIndex:0]];
    [QuantcastMeasurement sharedInstance].enableLogging = debugEnabled;
}

- (void)uploadEventCount:(CDVInvokedUrlCommand*)command{
    NSInteger intVal = [self argumentAsInt:[command.arguments objectAtIndex:0]];
    [QuantcastMeasurement sharedInstance].uploadEventCount = intVal;
}


-(void)quantcastOptOutStatusDidChange:(BOOL)inOptOutStatus{
    if(self.optOutDisplayCallbackID){
        //launch this on main thread Dispatch doesnt seem to work for some reason which is strange but oh well
        [self performSelectorOnMainThread:@selector(notifyOptOut:) withObject:[NSNumber numberWithBool:inOptOutStatus] waitUntilDone:NO];
    }
}

-(void)notifyOptOut:(NSNumber*)optChange{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:[optChange boolValue]];
    [self writeJavascript:[result toSuccessCallbackString:self.optOutDisplayCallbackID]];
    self.optOutDisplayCallbackID = nil;
}


//These helper methods will try to cast the object to teh appropiate type if possible
//Java script is loosly typed so I dont want to be too strict with my interpretation
-(NSString*)argumentAsString:(id) object{
    NSString* retval = nil;
    if([object isKindOfClass:[NSString class]]){
        retval = object;
    }else if([object isKindOfClass:[NSNumber class]]){
        retval = [object stringValue];
    }
    return  retval;
}

-(NSInteger)argumentAsInt:(id) object{
    NSInteger retval = -1;
    if([object isKindOfClass:[NSString class]] || [object isKindOfClass:[NSNumber class]]){
        retval = [object integerValue];
    }
    return retval;
}

-(BOOL)argumentAsBool:(id) object{
    BOOL retval = NO;
    if([object isKindOfClass:[NSString class]] || [object isKindOfClass:[NSNumber class]]){
        retval = [object boolValue];
    }
    return retval;
}

-(id<NSObject>)argumentAsLabel:(id<NSObject>)labels appendingItem:(NSString*)newItem{
    id<NSObject> retval = nil;
    if(labels == nil){
        retval = newItem;
    }else if([labels isKindOfClass:[NSString class]]){
        retval = [NSArray arrayWithObjects:labels, newItem, nil];
    }else if([labels isKindOfClass:[NSArray class]]){
        NSArray* labelArray = (NSArray*)labels;
        retval = [labelArray arrayByAddingObject:newItem];
    }
    return retval;
}

-(id<NSObject>)argumentAsLabel:(id<NSObject>)labels{
    id<NSObject> retval = nil;
    if([labels isKindOfClass:[NSString class]] || [labels isKindOfClass:[NSArray class]]){
        retval = labels;
    }
    return retval;
}

@end
