#import "NetworkBrotli.h"
#import <React/RCTBridge.h>
#import <React/RCTNetworking.h>

@interface NetworkBrotli () {
    BOOL _isInitialized;
    BOOL _isEnabled;
    NSInteger _totalRequests;
    NSInteger _brotliRequests;
    NSInteger _bytesDecompressed;
}
@end

@implementation NetworkBrotli
RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _isInitialized = NO;
        _isEnabled = YES;
        _totalRequests = 0;
        _brotliRequests = 0;
        _bytesDecompressed = 0;
    }
    return self;
}

- (void)initialize:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
    @try {
        if (_isInitialized) {
            resolve(@YES);
            return;
        }
        
        // Register custom URL protocol for Brotli handling
        [NSURLProtocol registerClass:[BrotliURLProtocol class]];
        
        _isInitialized = YES;
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"INIT_ERROR", @"Failed to initialize Brotli support", [NSError errorWithDomain:@"NetworkBrotli" code:1001 userInfo:@{NSLocalizedDescriptionKey: exception.reason}]);
    }
}

- (void)isEnabled:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
    resolve(@(_isEnabled));
}

- (void)setEnabled:(BOOL)enabled
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
    @try {
        _isEnabled = enabled;
        resolve([NSNull null]);
    } @catch (NSException *exception) {
        reject(@"SET_ENABLED_ERROR", @"Failed to set enabled state", [NSError errorWithDomain:@"NetworkBrotli" code:1002 userInfo:@{NSLocalizedDescriptionKey: exception.reason}]);
    }
}

- (void)getStats:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
    @try {
        double compressionRatio = _totalRequests > 0 ? (double)_brotliRequests / (double)_totalRequests : 0.0;
        
        NSDictionary *stats = @{
            @"totalRequests": @(_totalRequests),
            @"brotliRequests": @(_brotliRequests),
            @"bytesDecompressed": @(_bytesDecompressed),
            @"compressionRatio": @(compressionRatio)
        };
        
        resolve(stats);
    } @catch (NSException *exception) {
        reject(@"GET_STATS_ERROR", @"Failed to get stats", [NSError errorWithDomain:@"NetworkBrotli" code:1003 userInfo:@{NSLocalizedDescriptionKey: exception.reason}]);
    }
}

- (void)resetStats:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
    @try {
        _totalRequests = 0;
        _brotliRequests = 0;
        _bytesDecompressed = 0;
        resolve([NSNull null]);
    } @catch (NSException *exception) {
        reject(@"RESET_STATS_ERROR", @"Failed to reset stats", [NSError errorWithDomain:@"NetworkBrotli" code:1004 userInfo:@{NSLocalizedDescriptionKey: exception.reason}]);
    }
}

+ (NetworkBrotli *)sharedInstance {
    static NetworkBrotli *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[NetworkBrotli alloc] init];
    });
    return sharedInstance;
}

- (void)incrementTotalRequests {
    _totalRequests++;
}

- (void)incrementBrotliRequests {
    _brotliRequests++;
}

- (void)addBytesDecompressed:(NSInteger)bytes {
    _bytesDecompressed += bytes;
}

- (BOOL)isBrotliEnabled {
    return _isEnabled;
}

// Standard bridge methods
+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

// TurboModule methods
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::ObjCTurboModule>(params);
}

@end

// Custom NSURLProtocol for handling Brotli decompression
@interface BrotliURLProtocol : NSURLProtocol
@end

@implementation BrotliURLProtocol

+ (BOOL)canInitWithRequest:(NSURLRequest *)request {
    // Only handle HTTP/HTTPS requests that might have Brotli compression
    if (![request.URL.scheme isEqualToString:@"http"] && ![request.URL.scheme isEqualToString:@"https"]) {
        return NO;
    }
    
    // Avoid handling requests that have already been processed
    if ([NSURLProtocol propertyForKey:@"BrotliProcessed" inRequest:request]) {
        return NO;
    }
    
    return YES;
}

+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request {
    return request;
}

+ (BOOL)requestIsCacheEquivalent:(NSURLRequest *)a toRequest:(NSURLRequest *)b {
    return [super requestIsCacheEquivalent:a toRequest:b];
}

- (void)startLoading {
    NetworkBrotli *brotli = [NetworkBrotli sharedInstance];
    [brotli incrementTotalRequests];
    
    NSMutableURLRequest *mutableRequest = [self.request mutableCopy];
    [NSURLProtocol setProperty:@YES forKey:@"BrotliProcessed" inRequest:mutableRequest];
    
    // Add Brotli to Accept-Encoding if not already present
    NSString *acceptEncoding = [mutableRequest valueForHTTPHeaderField:@"Accept-Encoding"];
    if (!acceptEncoding || ![acceptEncoding containsString:@"br"]) {
        NSString *newAcceptEncoding = acceptEncoding ? [acceptEncoding stringByAppendingString:@", br"] : @"br, gzip, deflate";
        [mutableRequest setValue:newAcceptEncoding forHTTPHeaderField:@"Accept-Encoding"];
    }
    
    NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:mutableRequest completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            [self.client URLProtocol:self didFailWithError:error];
            return;
        }
        
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        NSString *contentEncoding = httpResponse.allHeaderFields[@"Content-Encoding"];
        
        if ([contentEncoding isEqualToString:@"br"] && [brotli isBrotliEnabled]) {
            [brotli incrementBrotliRequests];
            [brotli addBytesDecompressed:data.length];
            
            // TODO: Implement actual Brotli decompression
            // For this stub, we'll simulate successful decompression
            // In a real implementation, you would use a Brotli library like Google's Brotli
            
            NSMutableDictionary *mutableHeaders = [httpResponse.allHeaderFields mutableCopy];
            [mutableHeaders removeObjectForKey:@"Content-Encoding"];
            [mutableHeaders removeObjectForKey:@"Content-Length"];
            
            NSHTTPURLResponse *modifiedResponse = [[NSHTTPURLResponse alloc]
                initWithURL:httpResponse.URL
                statusCode:httpResponse.statusCode
                HTTPVersion:@"HTTP/1.1"
                headerFields:mutableHeaders];
            
            [self.client URLProtocol:self didReceiveResponse:modifiedResponse cacheStoragePolicy:NSURLCacheStorageNotAllowed];
            [self.client URLProtocol:self didLoadData:data];
        } else {
            [self.client URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
            [self.client URLProtocol:self didLoadData:data];
        }
        
        [self.client URLProtocolDidFinishLoading:self];
    }];
    
    [task resume];
}

- (void)stopLoading {
    // Clean up if needed
}

@end
