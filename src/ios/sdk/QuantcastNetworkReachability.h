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


#import <SystemConfiguration/SystemConfiguration.h>
#import <ifaddrs.h>
#import <sys/socket.h>
#import <netdb.h>
#import <arpa/inet.h>

typedef enum {
    QuantcastUnknownReachable = -1,
    QuantcastNotReachable = 0,
    QuantcastReachableViaWiFi,
    QuantcastReachableViaWWAN
} QuantcastNetworkStatus;

#define kQuantcastNetworkReachabilityChangedNotification @"QuantcastNetworkReachabilityChangedNotification"

/*!
 @internal
 @protocol QuantcastNetworkReachability
 @abstract Protocol for object that provides network reachability status.
 */
@protocol QuantcastNetworkReachability <NSObject>

@required
-(QuantcastNetworkStatus)currentReachabilityStatus;
-(NSString*)reachabilityAsString:(QuantcastNetworkStatus)status;

@end
