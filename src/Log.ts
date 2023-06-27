
export default class Log {

  public static d(...params)
  : void {
    // works only in firefox right now

    // Get the user-agent string
    let userAgentString = navigator.userAgent;

    // Detect Firefox
    let firefoxAgent = userAgentString.indexOf("Firefox") > -1;

    // Detect Chrome
    let chromeAgent = userAgentString.indexOf("Chrome") > -1;

    let obj = Error().stack

    if (chromeAgent) {
      let parentTrace = obj.toString().split("at")[2]
      let parentTraceMethodName = parentTrace.split("(")[0]
      let parentTraceFileName = parentTrace.split("/").at(-1).split("?")[0]
      console.log(`[ ${parentTraceFileName} - ${parentTraceMethodName} ]`, ...params)
    }
    else if (firefoxAgent) {
      let parentTrace = obj.split("\n")[1]
      let parentTraceMethodName = parentTrace.split("@")[0]
      let parentTraceFileName = parentTrace.split("/").at(-1).split("?")[0]

      console.log(`[ ${parentTraceFileName} - ${parentTraceMethodName} ]`, ...params)
    }
    else {
      console.error(`browser '${userAgentString}' is not supported`)
    }
  }

}
