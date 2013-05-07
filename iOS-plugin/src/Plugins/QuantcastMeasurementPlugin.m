//
//  QuantcastMeasurementPlugin.m
//  PhoneGapMeasurement
//
//  Created by Kevin Smith on 4/9/13.
//
//

#import "QuantcastMeasurementPlugin.h"
#import "QuantcastMeasurement.h"

@interface QuantcastMeasurementPlugin ()<QuantcastOptOutDelegate>{
    NSString* _optOutDisplayCallbackID;  //we have to hold this for the delegate callback
    

    id _quickTerminateNotif;
}
@end


@implementation QuantcastMeasurementPlugin

-(void)dealloc{
    [super dealloc];
    [[NSNotificationCenter defaultCenter] removeObserver:_quickTerminateNotif];
    [_optOutDisplayCallbackID release];
}


- (void)beginMeasurementSession:(CDVInvokedUrlCommand*)command{

    //always setup terminate notifications since phonegap doesnt have one
    _quickTerminateNotif = [[NSNotificationCenter defaultCenter] addObserverForName:UIApplicationWillTerminateNotification object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        
        [[QuantcastMeasurement sharedInstance] endMeasurementSessionWithLabels:nil];
    }];
    
    NSString *callbackId = command.callbackId;
    
    NSString* apiKey = [self argumentAsString:[command.arguments objectAtIndex:0]];
    NSString* userId = [self argumentAsString:[command.arguments objectAtIndex:1]];
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:2]];
    
    NSString* hash = [[QuantcastMeasurement sharedInstance] beginMeasurementSessionWithAPIKey:apiKey userIdentifier:userId labels:labels];
    
    if(callbackId){
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:hash];
        [self writeJavascript:[result toSuccessCallbackString:callbackId]];
    }
    
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
    id<NSObject> labels = [self argumentAsLabel:[command.arguments objectAtIndex:0]];
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

- (void)displayUserPrivacyDialog:(CDVInvokedUrlCommand*)command{
    if(command.callbackId){
        [_optOutDisplayCallbackID release];
        _optOutDisplayCallbackID = [command.callbackId copy];
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
    if(_optOutDisplayCallbackID){
        //launch this on main thread Dispatch doesnt seem to work for some reason which is strange but oh well
        [self performSelectorOnMainThread:@selector(notifyOptOut:) withObject:[NSNumber numberWithBool:inOptOutStatus] waitUntilDone:NO];
    }
}

-(void)notifyOptOut:(NSNumber*)optChange{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:[optChange boolValue]];
    [self writeJavascript:[result toSuccessCallbackString:_optOutDisplayCallbackID]];
    [_optOutDisplayCallbackID release];
    _optOutDisplayCallbackID = nil;
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

-(id<NSObject>)argumentAsLabel:(id<NSObject>)labels{
    id<NSObject> retval = nil;
    if([labels isKindOfClass:[NSString class]] || [labels isKindOfClass:[NSArray class]]){
        retval = labels;
    }
    return retval;
}

@end
