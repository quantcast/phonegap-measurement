package com.quantcast.phonegapplugin;

import android.util.Log;
import com.quantcast.measurement.service.QuantcastClient;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class QuantcastMeasurementPlugin extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        boolean retval = true;
        if (action.equals("beginMeasurementSession")) {
            String apiKey = args.getString(0);
            String userId = args.getString(1);
            String[] labels = this.getLabels(args.get(2));
            QuantcastClient.beginSessionWithApiKeyAndWithUserId(cordova.getActivity(), apiKey, userId, labels);
        } else if (action.equals("endMeasurementSession")) {
            QuantcastClient.endSession(cordova.getActivity(), this.getLabels(args.get(0)));
        } else if (action.equals("pauseMeasurementSession")) {
            QuantcastClient.pauseSession(this.getLabels(args.get(0)));
        } else if (action.equals("resumeMeasurementSession")) {
            QuantcastClient.resumeSession(this.getLabels(args.get(0)));
        } else if (action.equals("recordUserIdentifier")) {
            QuantcastClient.recordUserIdentifier(args.getString(0));
        } else if (action.equals("logEvent")) {
            QuantcastClient.logEvent(args.getString(0), this.getLabels(args.get(1)));
        } else if (action.equals("setGeolocation")) {
            QuantcastClient.setEnableLocationGathering(args.getBoolean(0));
        } else if (action.equals("setDebugLogging")) {
            boolean logOn = args.getBoolean(0);
            QuantcastClient.setLogLevel(logOn ? Log.VERBOSE : Log.ERROR);
        } else if (action.equals("displayUserPrivacyDialog")) {
            QuantcastClient.showAboutQuantcastScreen(cordova.getActivity());
        } else if (action.equals("uploadEventCount")) {
            QuantcastClient.setUploadEventCount(args.getInt(0));
        } else {
            //anything else I don't know
            retval = false;
        }
        return retval;
    }

    private String[] getLabels(Object labels) throws JSONException {
        String[] label;
        if (labels instanceof JSONArray) {
            label = new String[((JSONArray) labels).length()];
            for (int i = 0; i < ((JSONArray) labels).length(); ++i) {
                label[i] = ((JSONArray) labels).getString(i);
            }

        } else if (labels instanceof String) {
            label = new String[]{(String) labels};
        } else {
            label = new String[0];
        }
        return label;
    }
}


