import Random from 'random-js';

const random = new Random();
function generateZipkinTraceId() {
  return random.hex(16);
}

const filter = {
  urls: ['*://*/*'],
};

export default function attachBeforeSendHeadersListener(webRequest) {
  webRequest.onBeforeSendHeaders.addListener(
    ({ requestHeaders = [] }) => {
      const traceId = generateZipkinTraceId();
      const zipkinHeaders = {
        'X-Zipkin-Extension': '1',
        // This flag means instrumentation shouldn't throw away this trace
        'X-B3-Sampled': '1',
        // This flag means the collection tier shouldn't throw away this trace
        'X-B3-Flags': '1',
        'X-B3-TraceId': traceId,
        'X-B3-SpanId': traceId,
      };

      return {
        requestHeaders: [
          ...requestHeaders,
          ...Object.entries(zipkinHeaders).map(([name, value]) => ({
            name,
            value,
          })),
        ],
      };
    },
    filter,
    ['blocking', 'requestHeaders'],
  );
}
